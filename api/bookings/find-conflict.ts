// Diagnostic API to find conflicting bookings
// This helps debug why a booking conflict is detected but not visible in UI

import { supabase } from "@/integrations/supabase/client";

function j(res: unknown, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return j({ ok: false, error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json();
    const { station_id, booking_date, start_time, end_time } = payload;

    if (!station_id || !booking_date || !start_time || !end_time) {
      return j({ 
        ok: false, 
        error: "Missing required fields: station_id, booking_date, start_time, end_time" 
      }, 400);
    }

    console.log("🔍 Finding conflicting bookings:", {
      station_id,
      booking_date,
      start_time,
      end_time
    });

    // Find all bookings that overlap with the given time slot
    // Check both the specified date and the next day (in case booking spans midnight)
    const nextDay = new Date(booking_date);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    // Query for overlapping bookings on the specified date
    const { data: bookings1, error: error1 } = await supabase
      .from('bookings')
      .select(`
        id,
        station_id,
        booking_date,
        start_time,
        end_time,
        status,
        customer_id,
        payment_txn_id,
        created_at,
        stations!inner(name)
      `)
      .eq('station_id', station_id)
      .eq('booking_date', booking_date)
      .in('status', ['confirmed', 'in-progress'])
      .or(
        `and(start_time.lte.${start_time},end_time.gt.${start_time}),` + // Case 1: Existing starts during new
        `and(start_time.lt.${end_time},end_time.gte.${end_time}),` + // Case 2: Existing ends during new
        `and(start_time.gte.${start_time},end_time.lte.${end_time}),` + // Case 3: Existing contained in new
        `and(start_time.lte.${start_time},end_time.gte.${end_time})` // Case 4: New contained in existing
      );

    // Also check the next day in case the booking spans midnight
    const { data: bookings2, error: error2 } = await supabase
      .from('bookings')
      .select(`
        id,
        station_id,
        booking_date,
        start_time,
        end_time,
        status,
        customer_id,
        payment_txn_id,
        created_at,
        stations!inner(name)
      `)
      .eq('station_id', station_id)
      .eq('booking_date', nextDayStr)
      .in('status', ['confirmed', 'in-progress'])
      .or(
        `and(start_time.lte.${start_time},end_time.gt.${start_time}),` +
        `and(start_time.lt.${end_time},end_time.gte.${end_time}),` +
        `and(start_time.gte.${start_time},end_time.lte.${end_time}),` +
        `and(start_time.lte.${start_time},end_time.gte.${end_time})`
      );

    if (error1 || error2) {
      console.error("❌ Error finding conflicts:", error1 || error2);
      return j({ 
        ok: false, 
        error: "Database error", 
        details: (error1 || error2)?.message 
      }, 500);
    }

    const allConflicts = [...(bookings1 || []), ...(bookings2 || [])];

    // Also check using the database function
    const { data: hasOverlap, error: overlapError } = await (supabase as any).rpc('check_booking_overlap', {
      p_station_id: station_id,
      p_booking_date: booking_date,
      p_start_time: start_time,
      p_end_time: end_time,
      p_exclude_booking_id: null,
    });

    return j({
      ok: true,
      station_id,
      booking_date,
      start_time,
      end_time,
      has_overlap: hasOverlap === true,
      overlap_error: overlapError,
      conflicting_bookings: allConflicts.map(b => ({
        id: b.id,
        station_id: b.station_id,
        station_name: (b.stations as any)?.name,
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        customer_id: b.customer_id,
        payment_txn_id: b.payment_txn_id,
        created_at: b.created_at,
      })),
      count: allConflicts.length
    });

  } catch (error: any) {
    console.error("💥 Error in find-conflict:", error);
    return j({ 
      ok: false, 
      error: "Unexpected error",
      details: error.message
    }, 500);
  }
}
