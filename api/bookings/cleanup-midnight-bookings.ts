// Cleanup script to find and optionally remove phantom bookings blocking the last slot (23:30-23:59:59)
// This helps identify if there are actual bookings or if it's a false positive

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
    const { station_id, booking_date, action = "find" } = payload; // action: "find" or "delete"

    if (!station_id || !booking_date) {
      return j({ 
        ok: false, 
        error: "Missing required fields: station_id, booking_date" 
      }, 400);
    }

    console.log("🔍 Checking for bookings blocking last slot (23:30-23:59:59):", {
      station_id,
      booking_date,
      action
    });

    // Find all bookings that might be blocking the 23:30-23:59:59 slot
    const { data: allBookings, error: allError } = await supabase
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
      .order('start_time', { ascending: true });

    // Filter bookings that overlap with 23:30-23:59:59 (standard overlap check)
    const blockingBookings = allBookings?.filter(b => {
      const bStart = b.start_time;
      const bEnd = b.end_time;
      const slotStart = '23:30:00';
      const slotEnd = '23:59:59';
      
      // Standard overlap check (no midnight handling needed)
      return (
        (bStart <= slotStart && bEnd > slotStart) ||
        (bStart < slotEnd && bEnd >= slotEnd) ||
        (bStart >= slotStart && bEnd <= slotEnd) ||
        (bStart <= slotStart && bEnd >= slotEnd)
      );
    }) || [];

    // Also check what the database function returns
    const { data: hasOverlap, error: overlapError } = await (supabase as any).rpc('check_booking_overlap', {
      p_station_id: station_id,
      p_booking_date: booking_date,
      p_start_time: '23:30:00',
      p_end_time: '23:59:59',
      p_exclude_booking_id: null,
    });

    let deletedCount = 0;
    if (action === "delete" && blockingBookings.length > 0) {
      // Only delete if status is not 'confirmed' or 'in-progress', or if explicitly requested
      const { data: deleted, error: deleteError } = await supabase
        .from('bookings')
        .delete()
        .in('id', blockingBookings.map(b => b.id))
        .in('status', ['cancelled', 'completed', 'no-show']); // Only delete non-active bookings
      
      if (!deleteError) {
        deletedCount = deleted?.length || 0;
      }
    }

    return j({
      ok: true,
      station_id,
      booking_date,
      test_slot: {
        start_time: '23:30:00',
        end_time: '23:59:59'
      },
      database_function_result: {
        has_overlap: hasOverlap,
        error: overlapError
      },
      all_bookings: allBookings?.map(b => ({
        id: b.id,
        station_name: (b.stations as any)?.name,
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        created_at: b.created_at,
        payment_txn_id: b.payment_txn_id,
      })) || [],
      blocking_bookings: blockingBookings.map(b => ({
        id: b.id,
        station_name: (b.stations as any)?.name,
        booking_date: b.booking_date,
        start_time: b.start_time,
        end_time: b.end_time,
        status: b.status,
        created_at: b.created_at,
        payment_txn_id: b.payment_txn_id,
      })),
      blocking_count: blockingBookings.length,
      deleted_count: deletedCount,
      action_taken: action
    });

  } catch (error: any) {
    console.error("💥 Error in cleanup-midnight-bookings:", error);
    return j({ 
      ok: false, 
      error: "Unexpected error",
      details: error.message
    }, 500);
  }
}
