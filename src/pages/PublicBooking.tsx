import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StationSelector } from "@/components/booking/StationSelector";
import { TimeSlotPicker } from "@/components/booking/TimeSlotPicker";
import CouponPromotionalPopup from "@/components/CouponPromotionalPopup";
import BookingConfirmationDialog from "@/components/BookingConfirmationDialog";
import LegalDialog from "@/components/dialog/LegalDialog";
import { useSubscription } from "@/context/SubscriptionContext";
import PublicBookingUnavailableDialog from "@/components/PublicBookingUnavailableDialog";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Gamepad2,
  Timer,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lock,
  X,
  CreditCard,
  Headset,
  LogIn,
  Trophy,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { format, parse, getDay } from "date-fns";
/* =========================
   Types
   ========================= */
interface Station {
  id: string;
  name: string;
  type: 'ps5' | '8ball' | 'vr' | 'turf' | 'pickleball';
  hourly_rate: number;
}
interface TimeSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  status?: 'available' | 'booked' | 'elapsed';
}
interface CustomerInfo {
  id?: string;
  name: string;
  phone: string;
  email: string;
}
interface TodayBookingRow {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show";
  station_id: string;
  customer_id: string;
  stationName: string;
  customerName: string;
  customerPhone: string;
}

/* =========================
   Helpers
   ========================= */
const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const genTxnId = () =>
  `CUE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const isHappyHour = (date: Date, slot: TimeSlot | null) => {
  if (!slot) return false;
  const day = getDay(date);
  const startHour = Number(slot.start_time.split(":")[0]);
  return day >= 1 && day <= 5 && startHour >= 11 && startHour < 16;
};

// ✅ NEW: Phone number normalization
const normalizePhoneNumber = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// ✅ NEW: Generate unique Customer ID
const generateCustomerID = (phone: string): string => {
  const normalized = normalizePhoneNumber(phone);
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const phoneHash = normalized.slice(-4);
  return `CUE${phoneHash}${timestamp}`;
};

// ✅ NEW: Validate Indian phone number
const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(normalized)) {
    return { valid: false, error: 'Please enter a valid Indian mobile number (starting with 6, 7, 8, or 9)' };
  }

  return { valid: true };
};

const getSlotDuration = (stationType: string) => {
  return 60; // All slots are now 1 hour
};

const getBookingDuration = (stationIds: string[], stations: Station[]) => {
  return 60; // All bookings are now 1 hour per slot
};

/* =========================
   Component
   ========================= */
export default function PublicBooking() {
  const { hasBookingAccess, isLoading: subscriptionLoading } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStations, setSelectedStations] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedSlotRange, setSelectedSlotRange] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (!subscriptionLoading && !hasBookingAccess) {
      setShowUpgradeDialog(true);
    }
  }, [hasBookingAccess, subscriptionLoading]);

  const [customerNumber, setCustomerNumber] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
  });
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, string>>({});
  const [couponCode, setCouponCode] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<"venue" | "razorpay">("razorpay");
  const [loading, setLoading] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [payAtVenueEnabled, setPayAtVenueEnabled] = useState(false);
  const [pinInput, setPinInput] = useState("");

  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [bookingConfirmationData, setBookingConfirmationData] = useState<any>(null);
  const [showLegalDialog, setShowLegalDialog] = useState(false);
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [legalDialogType, setLegalDialogType] = useState<
    "terms" | "privacy" | "contact"
  >("terms");
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [todayRows, setTodayRows] = useState<TodayBookingRow[]>([]);
  const [todayLoading, setTodayLoading] = useState(false);
  const [showSportSelectionDialog, setShowSportSelectionDialog] = useState(false);
  const [pendingStationId, setPendingStationId] = useState<string | null>(null);
  const [selectedSport, setSelectedSport] = useState<'cricket' | 'football'>('cricket');
  const [stationSports, setStationSports] = useState<Record<string, 'cricket' | 'football'>>({});
  
  const [searchParams, setSearchParams] = useSearchParams();

  // Load Razorpay script on mount (since razorpay is the default payment method)
  useEffect(() => {
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("✅ Razorpay script loaded");
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        toast.error("Failed to load payment gateway. Please refresh the page.");
      };
      document.body.appendChild(script);
    }
  }, []); // Load once on mount

  useEffect(() => {
    fetchStations();
    fetchTodaysBookings();
  }, []);

  useEffect(() => {
    if (appliedCoupons["8ball"] === "HH99" && !isHappyHour(selectedDate, selectedSlot)) {
      setAppliedCoupons((prev) => {
        const copy = { ...prev };
        delete copy["8ball"];
        toast.error("❌ HH99 removed: valid only Mon–Fri 11 AM–4 PM");
        return copy;
      });
    }
    if (appliedCoupons["ps5"] === "HH99" && !isHappyHour(selectedDate, selectedSlot)) {
      setAppliedCoupons((prev) => {
        const copy = { ...prev };
        delete copy["ps5"];
        toast.error("❌ HH99 removed: valid only Mon–Fri 11 AM–4 PM");
        return copy;
      });
    }
  }, [selectedDate, selectedSlot, appliedCoupons]);

  useEffect(() => {
    const ch = supabase
      .channel("booking-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          if (selectedStations.length > 0 && selectedDate) fetchAvailableSlots();
          fetchTodaysBookings();
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [selectedStations, selectedDate]);

  useEffect(() => {
    if (selectedStations.length > 0 && selectedDate) fetchAvailableSlots();
    else {
      setAvailableSlots([]);
      setSelectedSlot(null);
      setSelectedSlotRange([]);
    }
  }, [selectedStations, selectedDate]);

  // Auto-search customer when phone number reaches 10 digits
  useEffect(() => {
    const normalized = normalizePhoneNumber(customerNumber);
    if (normalized.length === 10 && !hasSearched && !searchingCustomer) {
      const timer = setTimeout(async () => {
        if (!customerNumber.trim()) {
          return;
        }

        const normalizedPhone = normalizePhoneNumber(customerNumber);
        
        const validation = validatePhoneNumber(normalizedPhone);
        if (!validation.valid) {
          return;
        }

        setSearchingCustomer(true);
        try {
          const { data, error } = await supabase
            .from("customers")
            .select("id, name, phone, email, custom_id")
            .eq("phone", normalizedPhone)
            .maybeSingle();
            
          if (error && (error as any).code !== "PGRST116") throw error;

          if (data) {
            setIsReturningCustomer(true);
            setCustomerInfo({
              id: data.id,
              name: data.name,
              phone: normalizedPhone,
              email: data.email || "",
            });
            toast.success(`Welcome back, ${data.name}! 🎮`);
          } else {
            setIsReturningCustomer(false);
            setCustomerInfo({ 
              name: "", 
              phone: normalizedPhone,
              email: "" 
            });
            toast.info("New customer! Please fill in your details below.");
          }
          setHasSearched(true);
        } catch (e) {
          console.error(e);
          // Silently fail for auto-search
        } finally {
          setSearchingCustomer(false);
        }
      }, 500); // Small delay to avoid immediate search on typing
      return () => clearTimeout(timer);
    }
  }, [customerNumber, hasSearched, searchingCustomer]);

  async function fetchStations() {
    try {
      const { data, error } = await supabase
        .from("stations")
        .select("id, name, type, hourly_rate")
        .order("name");
      if (error) throw error;
      // Sort stations: 8ball (Cricket) first, then ps5 (Football), then vr (Pickleball)
      const sortedStations = (data || []).sort((a, b) => {
        const typeOrder: Record<string, number> = { '8ball': 0, 'ps5': 1, 'vr': 2 };
        const aOrder = typeOrder[a.type] ?? 99;
        const bOrder = typeOrder[b.type] ?? 99;
        if (aOrder !== bOrder) {
          return aOrder - bOrder;
        }
        // If same type, sort by name
        return a.name.localeCompare(b.name);
      });
      setStations(sortedStations as Station[]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load stations");
    }
  }

  async function fetchAvailableSlots() {
    if (selectedStations.length === 0) return;
    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
      
      const slotDuration = 60; // All slots are 1 hour
      
      if (selectedStations.length === 1) {
        const { data, error } = await supabase.rpc("get_available_slots", {
          p_date: dateStr,
          p_station_id: selectedStations[0],
          p_slot_duration: slotDuration,
        });
        if (error) {
          console.error("Error fetching slots:", error);
          throw error;
        }
        
        let slotsToSet = data || [];
        
        if (isToday) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          slotsToSet = slotsToSet.map((slot: TimeSlot) => {
            const [slotHour, slotMinute] = slot.start_time.split(':').map(Number);
            
            const isPast = (slotHour < currentHour) || 
                          (slotHour === currentHour && slotMinute <= currentMinute);
            
            if (isPast) {
              return {
                ...slot,
                is_available: false,
                status: 'elapsed' as const
              };
            }
            return slot;
          });
        }
        
        setAvailableSlots(slotsToSet);
      } else {
        const results = await Promise.all(
          selectedStations.map((id) =>
            supabase.rpc("get_available_slots", {
              p_date: dateStr,
              p_station_id: id,
              p_slot_duration: slotDuration,
            })
          )
        );
        const base = results.find((r) => !r.error && Array.isArray(r.data))
          ?.data as TimeSlot[] | undefined;
        if (!base) {
          const firstErr = results.find((r) => r.error)?.error;
          if (firstErr) throw firstErr;
          setAvailableSlots([]);
          return;
        }
        const key = (s: TimeSlot) => `${s.start_time}-${s.end_time}`;
        const union = new Map<string, boolean>();
        base.forEach((s) => union.set(key(s), Boolean(s.is_available)));
        results.forEach((r) => {
          (r.data || []).forEach((s: TimeSlot) => {
            const k = key(s);
            union.set(k, union.get(k) || Boolean(s.is_available));
          });
        });
        let merged = base.map((s) => ({
          ...s,
          is_available: union.get(key(s)) ?? false,
        }));
        
        if (isToday) {
          const now = new Date();
          const currentHour = now.getHours();
          const currentMinute = now.getMinutes();
          
          merged = merged.map((slot) => {
            const [slotHour, slotMinute] = slot.start_time.split(':').map(Number);
            
            const isPast = (slotHour < currentHour) || 
                          (slotHour === currentHour && slotMinute <= currentMinute);
            
            if (isPast) {
              return {
                ...slot,
                is_available: false,
                status: 'elapsed' as const
              };
            }
            return slot;
          });
        }
        
        setAvailableSlots(merged);
      }

      if (
        selectedSlot &&
        !availableSlots.some(
          (s) =>
            s.start_time === selectedSlot.start_time &&
            s.end_time === selectedSlot.end_time &&
            s.is_available
        )
      ) {
        setSelectedSlot(null);
      }
    } catch (e: any) {
      console.error("Error in fetchAvailableSlots:", e);
      const errorMessage = e?.message || e?.error?.message || "Failed to load time slots";
      toast.error(`Failed to load time slots: ${errorMessage}`);
    } finally {
      setSlotsLoading(false);
    }
  }

  // ✅ UPDATED: searchCustomer with phone normalization
  async function searchCustomer() {
    if (!customerNumber.trim()) {
      toast.error("Please enter a customer number");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(customerNumber);
    
    const validation = validatePhoneNumber(normalizedPhone);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid phone number");
      return;
    }

    setSearchingCustomer(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, email, custom_id")
        .eq("phone", normalizedPhone)
        .maybeSingle();
        
      if (error && (error as any).code !== "PGRST116") throw error;

      if (data) {
        setIsReturningCustomer(true);
        setCustomerInfo({
          id: data.id,
          name: data.name,
          phone: normalizedPhone,
          email: data.email || "",
        });
        toast.success(`Welcome back, ${data.name}! 🎮`);
      } else {
        setIsReturningCustomer(false);
        setCustomerInfo({ 
          name: "", 
          phone: normalizedPhone,
          email: "" 
        });
        toast.info("New customer! Please fill in your details below.");
      }
      setHasSearched(true);
    } catch (e) {
      console.error(e);
      toast.error("Failed to search customer");
    } finally {
      setSearchingCustomer(false);
    }
  }

  const handleStationToggle = (id: string) => {
    const station = stations.find(s => s.id === id);
    if (!station) return;
    
    // If deselecting, just remove it
    if (selectedStations.includes(id)) {
      setSelectedStations((prev) => prev.filter((x) => x !== id));
      setStationSports((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setSelectedSlot(null);
      setSelectedSlotRange([]);
      return;
    }
    
    // If selecting an 8ball station (Multi Sport Turf) or station name contains "Multi Sport", show sport selection dialog
    const isMultiSport = station.type === '8ball' || 
                        (station.type === 'turf' && station.name.toLowerCase().includes('multi')) ||
                        station.name.toLowerCase().includes('multi sport');
    if (isMultiSport) {
      console.log('Multi Sport Turf detected:', { id, name: station.name, type: station.type });
      setPendingStationId(id);
      setSelectedSport('cricket'); // Default to cricket
      setShowSportSelectionDialog(true);
      return;
    }
    
    // For other station types, directly add to selection
    setSelectedStations((prev) => [...prev, id]);
    setSelectedSlot(null);
    setSelectedSlotRange([]);
  };

  const handleSportSelectionConfirm = () => {
    if (!pendingStationId) return;
    
    // Store the selected sport for this station
    setStationSports((prev) => ({
      ...prev,
      [pendingStationId]: selectedSport
    }));
    
    setSelectedStations((prev) => [...prev, pendingStationId]);
    setSelectedSlot(null);
    setSelectedSlotRange([]);
    setShowSportSelectionDialog(false);
    setPendingStationId(null);
  };

  async function filterStationsForSlot(slot: TimeSlot) {
    if (selectedStations.length === 0) return selectedStations;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    
    const slotDuration = 60; // All slots are 1 hour
    
    const checks = await Promise.all(
      selectedStations.map(async (stationId) => {
        const { data, error } = await supabase.rpc("get_available_slots", {
          p_date: dateStr,
          p_station_id: stationId,
          p_slot_duration: slotDuration,
        });
        if (error) return { stationId, available: false };
        const match = (data || []).find(
          (s: any) =>
            s.start_time === slot.start_time &&
            s.end_time === slot.end_time &&
            s.is_available
        );
        return { stationId, available: Boolean(match) };
      })
    );
    const availableIds = checks.filter((c) => c.available).map((c) => c.stationId);
    const removed = checks.filter((c) => !c.available).map((c) => c.stationId);
    if (removed.length) {
      const names = stations
        .filter((s) => removed.includes(s.id))
        .map((s) => s.name)
        .join(", ");
      toast.message("Some stations aren't free at this time", {
        description: `Removed: ${names}.`,
      });
    }
    return availableIds;
  }

  async function handleSlotSelect(slot: TimeSlot | null, range?: TimeSlot[]) {
    // Handle deselection
    if (!slot) {
      setSelectedSlot(null);
      setSelectedSlotRange([]);
      return;
    }

    if (slot.status === 'elapsed') {
      toast.error("Cannot select a time slot that has already passed.");
      return;
    }
    
    // Limit to 1 hour (1 slot) only - ignore range parameter
    const singleSlot = [slot];
    
    if (selectedStations.length > 0) {
      // Check availability for the single slot
      let allAvailable = true;
      
      for (const checkSlot of singleSlot) {
        const filtered = await filterStationsForSlot(checkSlot);
        if (filtered.length === 0) {
          allAvailable = false;
          break;
        }
      }
      
      if (!allAvailable) {
        toast.error("Some time slots aren't available for the selected stations.");
        setSelectedSlot(null);
        setSelectedSlotRange([]);
        return;
      }
    }
    
    setSelectedSlot(slot);
    setSelectedSlotRange([slot]); // Only allow 1 hour (1 slot)
  }

  const allowedCoupons = [
    "TES1342",
    "NerfTurf25",
    "NerfTurf50",
    "HH99",
    "NIT50",
    "ALMA50",
    "AXEIST",
  ];

  function validateStudentID() {
    return window.confirm(
      "🎓 NerfTurf50 is for other college & school students ONLY.\nShow a valid student ID card during your visit for this discount at Turf 45. Apply?"
    );
  }

  function removeCoupon(key: string) {
    setAppliedCoupons((prev) => {
      const c = { ...prev };
      delete c[key];
      return c;
    });
  }

  function applyCoupon(raw: string) {
    const code = (raw || "").toUpperCase().trim();
    if (!allowedCoupons.includes(code)) {
      toast.error("🚫 Invalid coupon code. Please re-check and try again!");
      return;
    }

    const selectedHasTurf = selectedStations.some(
      (id) => stations.find((s) => s.id === id && s.type === "turf")
    );
    const selectedHasPickleball = selectedStations.some(
      (id) => stations.find((s) => s.id === id && s.type === "pickleball")
    );
    const selectedHasPS5 = selectedStations.some(
      (id) => stations.find((s) => s.id === id && s.type === "ps5")
    );
    const selectedHas8Ball = selectedStations.some(
      (id) => stations.find((s) => s.id === id && s.type === "8ball")
    );
    const selectedHasVR = selectedStations.some(
      (id) => stations.find((s) => s.id === id && s.type === "vr")
    );
    const happyHourActive = isHappyHour(selectedDate, selectedSlot);

    if (code === "TES1342") {
      setAppliedCoupons({ all: "TES1342" });
      toast.success("🧪 TES1342 applied: Test coupon - Price set to ₹1 for payment testing!");
      return;
    }

    if (code === "NerfTurf50") {
      if (!validateStudentID()) return;
      setAppliedCoupons({ all: "NerfTurf50" });
      toast.success(
        "📚 NerfTurf50 applied: 50% OFF for students with valid ID at Turf 45!\nShow your student ID when you visit! 🤝"
      );
      return;
    }

    if (code === "AXEIST") {
      const ok = window.confirm(
        "🥷 AXEIST grants 100% OFF for close friends. Apply?"
      );
      if (!ok) return;
      setAppliedCoupons({ all: "AXEIST" });
      toast.success("🥷 AXEIST applied! 100% OFF — Loyalty matters.");
      return;
    }

    if (code === "NerfTurf25") {
      setAppliedCoupons({ all: "NerfTurf25" });
      toast.success("🎉 NerfTurf25 applied: 25% OFF at Turf 45! Book more, play more! ⚽");
      return;
    }

    if (code === "HH99") {
      if (selectedHasVR) {
        toast.error("⏰ HH99 is not applicable to Pickleball courts.");
        return;
      }
      if (!(selectedHas8Ball || selectedHasPS5)) {
        toast.error("⏰ HH99 applies to Football and Cricket turfs during Happy Hours.");
        return;
      }
      if (!happyHourActive) {
        toast.error("🕒 HH99 valid only Mon–Fri 11 AM to 4 PM (Happy Hours).");
        return;
      }
      setAppliedCoupons((prev) => {
        let updated = { ...prev };
        if (selectedHas8Ball) updated["8ball"] = "HH99";
        if (selectedHasPS5) updated["ps5"] = "HH99";
        return updated;
      });
      toast.success(
        "⏰ HH99 applied! Football & Cricket turfs at ₹99/hour during Happy Hours! ✨"
      );
      return;
    }

    if (code === "NIT50") {
      if (!(selectedHas8Ball || selectedHasPS5 || selectedHasVR)) {
        toast.error(
          "NIT50 can be applied to Football, Cricket, or Pickleball courts in your selection."
        );
        return;
      }
      setAppliedCoupons((prev) => {
        let updated = { ...prev };
        if (selectedHasPS5) updated["ps5"] = "NIT50";
        if (selectedHas8Ball) updated["8ball"] = prev["8ball"] === "HH99" ? "HH99" : "NIT50";
        if (selectedHasVR) updated["vr"] = "NIT50";
        return updated;
      });
      let msg = "🎓 NIT50 applied! 50% OFF for ";
      const types = [];
      if (selectedHasPS5) types.push("Football");
      if (selectedHas8Ball) types.push("Cricket");
      if (selectedHasVR) types.push("Pickleball");
      msg += types.join(" & ") + " courts!";
      toast.success(msg);
      return;
    }

    if (code === "ALMA50") {
      if (!(selectedHas8Ball || selectedHasPS5 || selectedHasVR)) {
        toast.error(
          "ALMA50 can be applied to Football, Cricket, or Pickleball courts in your selection."
        );
        return;
      }
      setAppliedCoupons((prev) => {
        let updated = { ...prev };
        if (selectedHasPS5) updated["ps5"] = "ALMA50";
        if (selectedHas8Ball) updated["8ball"] = "ALMA50";
        if (selectedHasVR) updated["vr"] = "ALMA50";
        return updated;
      });
      let msg = "🏫 ALMA50 applied! 50% OFF for ";
      const types = [];
      if (selectedHasPS5) types.push("Football");
      if (selectedHas8Ball) types.push("Cricket");
      if (selectedHasVR) types.push("Pickleball");
      msg += types.join(" & ") + " courts!";
      toast.success(msg);
      return;
    }
  }

  const handleCouponApply = () => {
    applyCoupon(couponCode);
    setCouponCode("");
  };

  const calculateOriginalPrice = () => {
    if (selectedStations.length === 0 || !selectedSlot) return 0;
    const numberOfSlots = selectedSlotRange.length > 0 ? selectedSlotRange.length : 1;
    const stationPrice = stations
      .filter((s) => selectedStations.includes(s.id))
      .reduce((sum, s) => {
        // Price per 1-hour slot
        return sum + s.hourly_rate;
      }, 0);
    return stationPrice * numberOfSlots;
  };

  const calculateDiscount = () => {
    const original = calculateOriginalPrice();
    if (original === 0) return { total: 0, breakdown: {} as Record<string, number> };
    if (!Object.keys(appliedCoupons).length)
      return { total: 0, breakdown: {} as Record<string, number> };

    if (appliedCoupons["all"]) {
      if (appliedCoupons["all"] === "AXEIST")
        return { total: original, breakdown: { all: original } };
      if (appliedCoupons["all"] === "TES1342") {
        // Test coupon: Set price to ₹1 (discount = original - 1)
        const disc = Math.max(original - 1, 0);
        return { total: disc, breakdown: { all: disc } };
      }
      if (appliedCoupons["all"] === "NerfTurf25") {
        const disc = original * 0.25;
        return { total: disc, breakdown: { all: disc } };
      }
      if (appliedCoupons["all"] === "NerfTurf50") {
        const disc = original * 0.5;
        return { total: disc, breakdown: { all: disc } };
      }
      return { total: 0, breakdown: {} as Record<string, number> };
    }

    let totalDiscount = 0;
    const breakdown: Record<string, number> = {};

    if (
      appliedCoupons["8ball"] === "HH99" &&
      appliedCoupons["ps5"] === "NIT50"
    ) {
      const eightBalls = stations.filter(
        (s) => selectedStations.includes(s.id) && s.type === "8ball"
      );
      const sum = eightBalls.reduce((x, s) => x + s.hourly_rate, 0);
      const d = sum - eightBalls.length * 99;
      if (d > 0) {
        totalDiscount += d;
        breakdown["Cricket (HH99)"] = d;
      }
      const turfs = stations.filter(
        (s) => selectedStations.includes(s.id) && s.type === "turf"
      );
      const sum2 = turfs.reduce((x, s) => x + s.hourly_rate, 0);
      const d2 = sum2 * 0.5; // 50% off for turf
      totalDiscount += d2;
      breakdown["Turf (HH99+NIT50)"] = d2;
    } else {
      if (appliedCoupons["8ball"] === "HH99") {
        const eightBalls = stations.filter(
          (s) => selectedStations.includes(s.id) && s.type === "8ball"
        );
        const sum = eightBalls.reduce((x, s) => x + s.hourly_rate, 0);
        const d = sum - eightBalls.length * 99;
        if (d > 0) {
          totalDiscount += d;
          breakdown["Cricket (HH99)"] = d;
        }
      }

      if (appliedCoupons["turf"] === "HH99") {
        const turfs = stations.filter(
          (s) => selectedStations.includes(s.id) && s.type === "turf"
        );
        const sum = turfs.reduce((x, s) => x + s.hourly_rate, 0);
        const d = sum * 0.25; // 25% off for happy hour
        if (d > 0) {
          totalDiscount += d;
          breakdown["Turf (HH99)"] = d;
        }
      }

      if (appliedCoupons["8ball"] === "NIT50" || appliedCoupons["8ball"] === "ALMA50") {
        const balls = stations.filter(
          (s) => selectedStations.includes(s.id) && s.type === "8ball"
        );
        const sum = balls.reduce((x, s) => x + s.hourly_rate, 0);
        const d = sum * 0.5;
        totalDiscount += d;
        breakdown[`Cricket (${appliedCoupons["8ball"]})`] = d;
      }

      if (appliedCoupons["turf"] === "NIT50" || appliedCoupons["turf"] === "ALMA50") {
        const turfs = stations.filter(
          (s) => selectedStations.includes(s.id) && s.type === "turf"
        );
        const sum = turfs.reduce((x, s) => x + s.hourly_rate, 0);
        const d = sum * 0.5;
        totalDiscount += d;
        breakdown[`Turf (${appliedCoupons["turf"]})`] = d;
      }

      if (appliedCoupons["pickleball"] === "NIT50" || appliedCoupons["pickleball"] === "ALMA50") {
        const pickleballCourts = stations.filter(
          (s) => selectedStations.includes(s.id) && s.type === "pickleball"
        );
        const sum = pickleballCourts.reduce((x, s) => x + s.hourly_rate, 0);
        const d = sum * 0.5;
        totalDiscount += d;
        breakdown[`Pickleball (${appliedCoupons["pickleball"]})`] = d;
      }
    }

    return { total: totalDiscount, breakdown };
  };

  const originalPrice = calculateOriginalPrice();
  const discountObj = calculateDiscount();
  const discount = discountObj.total;
  const discountBreakdown = discountObj.breakdown;
  const finalPrice = Math.max(originalPrice - discount, 0);

  // Calculate number of selected slots
  const numberOfSelectedSlots = selectedSlotRange.length > 0 ? selectedSlotRange.length : (selectedSlot ? 1 : 0);
  // Allow 1-hour (1 slot) bookings
  const hasMinimumSlots = numberOfSelectedSlots >= 1;

  const isCustomerInfoComplete = () =>
    hasSearched && customerNumber.trim() !== "" && customerInfo.name.trim() !== "";
  const isStationSelectionAvailable = () => isCustomerInfoComplete();
  const isTimeSelectionAvailable = () =>
    isStationSelectionAvailable() && selectedStations.length > 0;

  // ✅ UPDATED: createVenueBooking with duplicate check and Customer ID
  async function createVenueBooking() {
    setLoading(true);
    try {
      // Check minimum slots requirement
      const slotsToBook = selectedSlotRange.length > 0 ? selectedSlotRange : [selectedSlot!];
      const minSlotsRequired = 1;
      if (slotsToBook.length < minSlotsRequired) {
        toast.error("Please select at least 1 slot (1 hour).");
        setLoading(false);
        return;
      }
      
      let customerId = customerInfo.id;
      
      if (!customerId) {
        const normalizedPhone = normalizePhoneNumber(customerInfo.phone);
        
        const validation = validatePhoneNumber(normalizedPhone);
        if (!validation.valid) {
          toast.error(validation.error || "Invalid phone number");
          setLoading(false);
          return;
        }

        // ✅ Check for duplicate phone number
        const { data: existingCustomer } = await supabase
          .from("customers")
          .select("id, name, custom_id")
          .eq("phone", normalizedPhone)
          .maybeSingle();

        if (existingCustomer) {
          customerId = existingCustomer.id;
          toast.info(`Using existing customer: ${existingCustomer.name}`);
        } else {
          const customerID = generateCustomerID(normalizedPhone);

          const { data: newCustomer, error: customerError } = await supabase
            .from("customers")
            .insert({
              name: customerInfo.name,
              phone: normalizedPhone,
              email: customerInfo.email || null,
              custom_id: customerID,
              is_member: false,
              loyalty_points: 0,
              total_spent: 0,
              total_play_time: 0,
            })
            .select("id")
            .single();
            
          if (customerError) {
            if (customerError.code === '23505') {
              toast.error("This phone number is already registered. Please search for your account.");
              setLoading(false);
              return;
            }
            throw customerError;
          }
          customerId = newCustomer.id;
          toast.success(`New customer created: ${customerID}`);
        }
      }

      const couponCodes = Object.values(appliedCoupons).join(",");
      const bookingDuration = 60; // 1 hour per slot
      
      // Validate booking slots for conflicts BEFORE creating
      for (const slot of slotsToBook) {
        for (const stationId of selectedStations) {
          const { data: hasOverlap, error: overlapError } = await (supabase as any).rpc('check_booking_overlap', {
            p_station_id: stationId,
            p_booking_date: format(selectedDate, "yyyy-MM-dd"),
            p_start_time: slot.start_time,
            p_end_time: slot.end_time,
            p_exclude_booking_id: null,
          });

          if (overlapError) {
            console.error("Error checking booking overlap:", overlapError);
            // Continue - database trigger will catch it
          } else if (hasOverlap === true) {
            // Get detailed conflict information for debugging
            const { data: conflictingBookings } = await supabase
              .from("bookings")
              .select(`
                id,
                booking_date,
                start_time,
                end_time,
                status,
                payment_txn_id,
                created_at,
                stations!inner(name)
              `)
              .eq("station_id", stationId)
              .eq("booking_date", format(selectedDate, "yyyy-MM-dd"))
              .in("status", ["confirmed", "in-progress"])
              .order("created_at", { ascending: false })
              .limit(10);
            
            // Standard overlap check (no midnight handling needed - slots end at 23:59:59)
            const slotStart = slot.start_time;
            const slotEnd = slot.end_time;
            
            const actualConflicts = conflictingBookings?.filter(b => {
              const bStart = b.start_time;
              const bEnd = b.end_time;
              
              return (
                (bStart <= slotStart && bEnd > slotStart) ||
                (bStart < slotEnd && bEnd >= slotEnd) ||
                (bStart >= slotStart && bEnd <= slotEnd) ||
                (bStart <= slotStart && bEnd >= slotEnd)
              );
            }) || [];

            console.error("🔍 Conflict details:", {
              slot: `${slot.start_time}-${slot.end_time}`,
              station_id: stationId,
              conflicting_bookings: actualConflicts.map(b => ({
                id: b.id,
                time: `${b.start_time}-${b.end_time}`,
                status: b.status,
                created_at: b.created_at
              }))
            });

            // Get station name for error message
            const station = stations.find(s => s.id === stationId);
            const stationName = station?.name || "this station";
            
            if (actualConflicts.length > 0) {
              const conflictDetails = actualConflicts.map(b => 
                `Booking ${b.id.slice(0, 8)}: ${b.start_time}-${b.end_time} (${b.status})`
              ).join(", ");
              throw new Error(`This time slot (${slot.start_time} - ${slot.end_time}) is already booked for ${stationName}. Conflicting: ${conflictDetails}`);
            } else {
              // Database says conflict but we can't find the booking - likely a bug
              console.warn("⚠️ Database reports conflict but no conflicting bookings found - possible bug in check_booking_overlap function");
              throw new Error(`This time slot (${slot.start_time} - ${slot.end_time}) appears to be booked for ${stationName}, but we cannot find the conflicting booking. Please contact support.`);
            }
          }
        }
      }
      
      // Create a booking row for each slot
      const rows: any[] = [];
      slotsToBook.forEach((slot) => {
        selectedStations.forEach((stationId) => {
          const station = stations.find(s => s.id === stationId);
          const isMultiSport = station?.type === '8ball' || 
                              (station?.type === 'turf' && station?.name.toLowerCase().includes('multi')) ||
                              station?.name.toLowerCase().includes('multi sport');
          const sport = isMultiSport ? stationSports[stationId] : null;
          const notes = sport ? `Sport: ${sport.charAt(0).toUpperCase() + sport.slice(1)}` : null;
          
          rows.push({
            station_id: stationId,
            customer_id: customerId!,
            booking_date: format(selectedDate, "yyyy-MM-dd"),
            start_time: slot.start_time,
            end_time: slot.end_time,
            duration: bookingDuration,
            status: "confirmed",
            original_price: originalPrice / slotsToBook.length / selectedStations.length,
            discount_percentage: discount > 0 ? (discount / originalPrice) * 100 : null,
            final_price: finalPrice / slotsToBook.length / selectedStations.length,
            coupon_code: couponCodes || null,
            notes: notes,
          });
        });
      });

      const { data: inserted, error: bookingError } = await supabase
        .from("bookings")
        .insert(rows)
        .select("id");
        
      if (bookingError) {
        // Check if error is due to booking conflict
        if (bookingError.code === '23505' || bookingError.message?.includes('Booking conflict')) {
          throw new Error("This time slot is already booked. Please select a different time.");
        }
        throw bookingError;
      }

      const stationObjects = stations.filter((s) =>
        selectedStations.includes(s.id)
      );
      
      const sessionDuration = `${slotsToBook.length} hour${slotsToBook.length > 1 ? 's' : ''} (${slotsToBook.length} slot${slotsToBook.length > 1 ? 's' : ''})`;
      
      setBookingConfirmationData({
        bookingId: inserted[0].id.slice(0, 8).toUpperCase(),
        customerName: customerInfo.name,
        stationNames: stationObjects.map((s) => s.name),
        date: format(selectedDate, "yyyy-MM-dd"),
        startTime: new Date(`2000-01-01T${slotsToBook[0].start_time}`).toLocaleTimeString(
          "en-US",
          { hour: "numeric", minute: "2-digit", hour12: true }
        ),
        endTime: new Date(`2000-01-01T${slotsToBook[slotsToBook.length - 1].end_time}`).toLocaleTimeString(
          "en-US",
          { hour: "numeric", minute: "2-digit", hour12: true }
        ),
        totalAmount: finalPrice,
        couponCode: couponCodes || undefined,
        discountAmount: discount > 0 ? discount : undefined,
        sessionDuration: sessionDuration,
      });
      setShowConfirmationDialog(true);

      toast.success("🎉 Booking confirmed! Get ready to game! 🎮");

      setSelectedStations([]);
      setSelectedSlot(null);
      setSelectedSlotRange([]);
      setCustomerNumber("");
      setCustomerInfo({ name: "", phone: "", email: "" });
      setIsReturningCustomer(false);
      setHasSearched(false);
      setCouponCode("");
      setAppliedCoupons({});
      setAvailableSlots([]);
    } catch (e) {
      console.error(e);
      toast.error("Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const initiateRazorpay = async () => {
    // 1. Validate inputs
    const slotsToBook = selectedSlotRange.length > 0 ? selectedSlotRange : (selectedSlot ? [selectedSlot] : []);
    
    // Check minimum slots requirement
    if (slotsToBook.length < 1) {
      toast.error("Please select at least 1 slot (1 hour).");
      return;
    }
    
    // finalPrice already includes all slots (calculateOriginalPrice multiplies by numberOfSlots)
    // So we don't need to multiply again
    const totalPrice = finalPrice;

    if (totalPrice <= 0) {
      toast.error("Amount must be greater than 0 for online payment.");
      return;
    }

    if (!(window as any).Razorpay) {
      toast.error("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    setLoading(true);
    try {
      // 2. Store pending booking in localStorage
      const bookingDuration = getBookingDuration(selectedStations, stations);
      const pendingBooking = {
        selectedStations,
        stationSports, // Include sport selections for Multi Sport Turf
        selectedDateISO: format(selectedDate, "yyyy-MM-dd"),
        slots: slotsToBook.map(slot => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
        })),
        duration: bookingDuration,
        customer: customerInfo,
        pricing: {
          // originalPrice and discount already include all slots, no need to multiply again
          original: originalPrice,
          discount: discount,
          final: totalPrice,
          coupons: Object.values(appliedCoupons).join(","),
        },
      };
      localStorage.setItem("pendingBooking", JSON.stringify(pendingBooking));

      // 3. Create order on server with full booking data
      // IMPORTANT: bookingData is stored in order notes so webhook can create booking automatically
      // This ensures bookings are created even if customer doesn't return to browser after payment
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          receipt: genTxnId(),
          notes: {
            customer_name: customerInfo.name,
            customer_phone: customerInfo.phone,
            customer_email: customerInfo.email || "",
            booking_date: format(selectedDate, "yyyy-MM-dd"),
            stations: selectedStations.join(","),
          },
          bookingData: pendingBooking, // Send full booking data for webhook (PRIMARY METHOD)
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData?.ok) {
        throw new Error(orderData?.error || "Failed to create payment order");
      }

      // 4. Get Razorpay Key ID
      const keyRes = await fetch("/api/razorpay/get-key-id");
      const keyData = await keyRes.json();

      if (!keyRes.ok || !keyData?.ok) {
        throw new Error(keyData?.error || "Failed to get payment gateway key");
      }

      // 5. Initialize Razorpay checkout
      const options = {
        key: keyData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Turf 45 Sports Turf",
        description: `Booking for ${slotsToBook.length} slot(s)`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // Redirect immediately - don't wait for reconciliation
          // Success page will handle reconciliation and booking lookup
          console.log("✅ Payment successful, redirecting to success page...");
          
          // Redirect immediately (non-blocking)
          window.location.href = `/public/payment/success?payment_id=${encodeURIComponent(response.razorpay_payment_id)}&order_id=${encodeURIComponent(response.razorpay_order_id)}&signature=${encodeURIComponent(response.razorpay_signature)}`;
          
          // Try reconciliation in background (non-blocking, don't wait)
          fetch("/api/razorpay/reconcile-payment", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
            }),
          }).catch(() => {
            // Ignore errors - success page will handle it
          });
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email || "",
          contact: customerInfo.phone,
        },
        theme: {
          color: "#8B5CF6", // Your brand color
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.info("Payment was cancelled");
          },
        },
      };

      // Show warning dialog before opening payment gateway
      setShowPaymentWarning(true);
      
      // Auto-dismiss warning after 4 seconds (gives user time to read it)
      const warningTimer = setTimeout(() => {
        setShowPaymentWarning(false);
      }, 4000);

      const rzp = new (window as any).Razorpay(options);

      // Close warning when payment gateway opens (if ready event fires)
      rzp.on("ready", function() {
        clearTimeout(warningTimer);
        setShowPaymentWarning(false);
      });

      rzp.on("payment.failed", function (response: any) {
        clearTimeout(warningTimer);
        setShowPaymentWarning(false);
        const error = response.error?.description || response.error?.reason || "Payment failed";
        toast.error(`Payment failed: ${error}`);
        setLoading(false);
        window.location.href = `/public/payment/failed?order_id=${encodeURIComponent(orderData.orderId)}&error=${encodeURIComponent(error)}`;
      });

      rzp.open();
      
      // Close warning after payment gateway is opened (fallback)
      setTimeout(() => {
        setShowPaymentWarning(false);
      }, 3500);
    } catch (e: any) {
      console.error("Razorpay payment error:", e);
      setShowPaymentWarning(false);
      toast.error(`Unable to start payment: ${e?.message || e}`);
      setLoading(false);
    }
  };

  async function handleConfirm() {
    if (!isCustomerInfoComplete()) {
      toast.error("Please complete customer information first");
      return;
    }
    if (selectedStations.length === 0) {
      toast.error("Please select at least one station");
      return;
    }
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!hasMinimumSlots) {
      const errorMessage = payAtVenueEnabled 
        ? "Please select at least 1 slot (1 hour)."
        : "Minimum booking is 1 slot (1 hour). Please select at least 1 slot.";
      toast.error(errorMessage);
      return;
    }
    if (!customerInfo.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    // Show warning immediately when user clicks confirm
    if (paymentMethod === "razorpay") {
      setShowPaymentWarning(true);
    }

    if (paymentMethod === "venue") {
      await createVenueBooking();
    } else {
      await initiateRazorpay();
    }
  }

  function maskPhone(p?: string) {
    if (!p) return "******";
    return "******";
  }

  function maskName(name?: string) {
    if (!name || name === "—") return "******";
    return "******";
  }

  async function fetchTodaysBookings() {
    setTodayLoading(true);
    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select(
          "id, booking_date, start_time, end_time, status, station_id, customer_id"
        )
        .eq("booking_date", todayStr)
        .order("start_time", { ascending: true });

      if (error) throw error;
      if (!bookingsData?.length) {
        setTodayRows([]);
        setTodayLoading(false);
        return;
      }

      const stationIds = [...new Set(bookingsData.map((b) => b.station_id))];
      const customerIds = [...new Set(bookingsData.map((b) => b.customer_id))];

      const [{ data: stationsData }, { data: customersData }] = await Promise.all([
        supabase.from("stations").select("id, name").in("id", stationIds),
        supabase.from("customers").select("id, name, phone").in("id", customerIds),
      ]);

      const rows: TodayBookingRow[] = bookingsData.map((b) => {
        const st = stationsData?.find((s) => s.id === b.station_id);
        const cu = customersData?.find((c) => c.id === b.customer_id);
        return {
          id: b.id,
          booking_date: b.booking_date,
          start_time: b.start_time,
          end_time: b.end_time,
          status: b.status as TodayBookingRow["status"],
          station_id: b.station_id,
          customer_id: b.customer_id,
          stationName: st?.name || "—",
          customerName: maskName(cu?.name),
          customerPhone: maskPhone(cu?.phone),
        };
      });

      setTodayRows(rows);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load today's bookings");
    } finally {
      setTodayLoading(false);
    }
  }

  const timeKey = (s: string, e: string) => {
    const start = new Date(`2000-01-01T${s}`);
    const end = new Date(`2000-01-01T${e}`);
    return `${start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })} — ${end.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  const groupedByTime = useMemo(() => {
    const map = new Map<string, TodayBookingRow[]>();
    todayRows.forEach((r) => {
      const k = timeKey(r.start_time, r.end_time);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    });
    const entries = Array.from(map.entries()).sort(([a], [b]) => {
      const aStart = parse(a.split(" — ")[0], "h:mm a", new Date()).getTime();
      const bStart = parse(b.split(" — ")[0], "h:mm a", new Date()).getTime();
      return aStart - bStart;
    });
    return entries;
  }, [todayRows]);

  const statusChip = (s: TodayBookingRow["status"]) => {
    const base = "px-2 py-0.5 rounded-full text-xs capitalize";
    switch (s) {
      case "confirmed":
        return (
          <span
            className={cn(
              base,
              "bg-blue-500/15 text-blue-300 border border-blue-400/20"
            )}
          >
            confirmed
          </span>
        );
      case "in-progress":
        return (
          <span
            className={cn(
              base,
              "bg-amber-500/15 text-amber-300 border border-amber-400/20"
            )}
          >
            in-progress
          </span>
        );
      case "completed":
        return (
          <span
            className={cn(
              base,
              "bg-green-500/15 text-green-300 border border-emerald-400/30"
            )}
          >
            completed
          </span>
        );
      case "cancelled":
        return (
          <span
            className={cn(
              base,
              "bg-rose-500/15 text-rose-300 border border-rose-400/20"
            )}
          >
            cancelled
          </span>
        );
      case "no-show":
        return (
          <span
            className={cn(
              base,
              "bg-zinc-500/15 text-zinc-300 border border-zinc-400/20"
            )}
          >
            no-show
          </span>
        );
      default:
        return (
          <span
            className={cn(
              base,
              "bg-zinc-500/15 text-zinc-300 border border-zinc-400/20"
            )}
          >
            {s}
          </span>
        );
    }
  };

  return (
    <>
      {/* Payment Warning Dialog - Non-dismissible */}
      <Dialog open={showPaymentWarning} onOpenChange={() => {}}>
        <DialogContent className="bg-gradient-to-br from-red-950/95 to-orange-950/95 border-2 border-red-500/50 shadow-2xl max-w-md z-[9999]" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-500/20 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-400 animate-pulse" />
              </div>
              <DialogTitle className="text-2xl font-bold text-red-600">
                ⚠️ IMPORTANT WARNING
              </DialogTitle>
            </div>
            <DialogDescription className="text-orange-700 text-base font-semibold leading-relaxed space-y-3 pt-2">
              <p className="text-lg font-bold text-white">
                DO NOT CLOSE OR REFRESH THIS PAGE!
              </p>
              <p className="text-orange-600">
                Your booking is being processed. Please wait until you see the booking confirmation page.
              </p>
              <p className="text-yellow-700 font-medium">
                Closing or refreshing now may result in payment failure or incomplete booking.
              </p>
              <div className="bg-yellow-50 rounded-lg p-3 mt-4 border border-yellow-300">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Keep this page open until you see "Booking Confirmed" message.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 via-green-950 to-black">
      {/* Green gradient mesh overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-transparent via-emerald-900/20 to-green-800/30"></div>
      
      {/* Animated green gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/4 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/25 via-green-400/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-green-600/20 via-emerald-600/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
        <div className="absolute -bottom-24 right-1/4 h-80 w-80 rounded-full bg-gradient-to-br from-green-500/25 via-emerald-500/20 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '1.5s' }} />
      </div>
      
      {/* Subtle mesh gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-600/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-emerald-600/15 via-transparent to-transparent"></div>

      {/* Coupon Promotional Popup - Hidden for now */}
      {/* <CouponPromotionalPopup onCouponSelect={applyCoupon} /> */}

      <header className="py-10 px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6">
              <img
                src="/Turf45_transparent.png"
                alt="TURF 45 Logo"
                className="h-24 cursor-pointer transition-transform hover:scale-105"
                style={{
                  filter: "drop-shadow(0 0 15px rgba(16, 185, 129, 0.5)) drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))",
                }}
                onClick={() => setShowPinDialog(true)}
                title="Click for secret feature"
              />
            </div>

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-3 py-1 text-xs tracking-widest uppercase text-emerald-200 backdrop-blur-md shadow-lg shadow-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              Premium Sports Turf
            </span>

            <h1 className="mt-3 text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
              Book Your Sports Session
            </h1>
            <p className="mt-2 text-lg text-gray-200 max-w-2xl text-center drop-shadow-lg">
              Reserve Football, Cricket, or Pickleball sessions at Turf 45
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] text-gray-200 backdrop-blur-md">
              <span className="font-semibold tracking-wide">Line of Business:</span>
              <span>
                Sports Turf Services (time-based Football, Cricket & Pickleball rentals)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="relative z-10 overflow-hidden border-y border-emerald-400/30 bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-emerald-500/10 backdrop-blur-sm">
        <div className="flex animate-scroll" style={{ width: '200%' }}>
          <div className="flex items-center gap-8 whitespace-nowrap py-3 px-4" style={{ width: '50%' }}>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Book MULTITURF if you want to book slots for Cricket and Football</span>
            </div>
            <div className="h-4 w-px bg-emerald-400/30"></div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Pay online and get 10 mins free time</span>
            </div>
            <div className="h-4 w-px bg-emerald-400/30"></div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Early bird discount: Book before 6 PM and save 15%</span>
            </div>
          </div>
          {/* Duplicate for seamless loop */}
          <div className="flex items-center gap-8 whitespace-nowrap py-3 px-4" style={{ width: '50%' }}>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Book MULTITURF if you want to book slots for Cricket and Football</span>
            </div>
            <div className="h-4 w-px bg-emerald-400/30"></div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Pay online and get 10 mins free time</span>
            </div>
            <div className="h-4 w-px bg-emerald-400/30"></div>
            <div className="flex items-center gap-2 text-emerald-300">
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">Early bird discount: Book before 6 PM and save 15%</span>
            </div>
          </div>
        </div>
      </div>

      <main className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto pb-14 relative z-10">
        <section className="mb-6 rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl px-4 py-4 text-sm text-gray-200 shadow-xl">
          <h2 className="mb-1 text-base font-semibold text-white">About Turf 45</h2>
          <p>
            Turf 45 offers <span className="font-medium text-white">time-based rentals</span> of
            Football courts, Cricket turfs, and Pickleball courts. Book 
            1-hour sessions for Football, Cricket, or Pickleball.
          </p>
          <p className="mt-2 text-gray-300">
            <span className="font-medium text-white">Pricing:</span> All prices are
            displayed in <span className="ml-1 font-semibold text-emerald-300">INR (₹)</span>.
          </p>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:shadow-2xl hover:border-emerald-400/30 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 ring-1 ring-white/20 flex items-center justify-center group-hover:bg-emerald-500/30 group-hover:ring-emerald-400/50 transition-all duration-300">
                    <User className="h-4 w-4 text-emerald-300 group-hover:text-emerald-200 transition-colors" />
                  </div>
                  Step 1: Customer Information
                  {isCustomerInfoComplete() && (
                    <CheckCircle className="h-5 w-5 text-emerald-300 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-sm text-emerald-300 font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Please complete customer
                    information to proceed with booking
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={customerNumber}
                    onChange={(e) => {
                      const value = e.target.value;
                      const normalized = normalizePhoneNumber(value);
                      
                      if (normalized.length <= 10) {
                        setCustomerNumber(normalized);
                        setHasSearched(false);
                        setIsReturningCustomer(false);
                        setCustomerInfo((prev) => ({
                          ...prev,
                          name: "",
                          email: "",
                          phone: normalized,
                        }));
                      }
                    }}
                    placeholder="Enter 10-digit phone number"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-xl flex-1"
                    maxLength={10}
                  />
                  <Button
                    onClick={searchCustomer}
                    disabled={searchingCustomer}
                    className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    {searchingCustomer ? "Searching..." : "Search"}
                  </Button>
                </div>

                {hasSearched && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-200 uppercase">
                        Full Name{" "}
                        {isReturningCustomer && (
                          <CheckCircle className="inline h-4 w-4 text-emerald-300 ml-1" />
                        )}
                      </Label>
                      <Input
                        value={customerInfo.name}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter your full name"
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-xl"
                        disabled={isReturningCustomer}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-200 uppercase">
                        Email (Optional)
                      </Label>
                      <Input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="Enter your email address"
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-xl"
                        disabled={isReturningCustomer}
                      />
                    </div>
                  </div>
                )}

                {isCustomerInfoComplete() && (
                  <div className="flex items-center gap-2 text-emerald-300 text-sm">
                    <CheckCircle className="h-4 w-4" /> Customer information complete!
                    You can now proceed to station selection.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl shadow-xl transition-all duration-300 hover:shadow-green-500/40 hover:shadow-2xl hover:border-emerald-400/30 group">
              <CardHeader className="relative pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg ring-1 ring-white/20 bg-gradient-to-br from-emerald-400/25 to-transparent group-hover:from-emerald-400/35 group-hover:ring-emerald-400/50 transition-all duration-300">
                      {!isStationSelectionAvailable() ? (
                        <Lock className="h-4 w-4 text-gray-300 group-hover:text-gray-200 transition-colors" />
                      ) : (
                        <MapPin className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                      )}
                    </div>
                    <CardTitle className="m-0 p-0 text-white group-hover:text-emerald-100 transition-colors">
                      Step 2: Select Sports Courts
                    </CardTitle>
                  </div>
                  {isStationSelectionAvailable() && selectedStations.length > 0 && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-xs text-green-300">
                      <CheckCircle className="h-3.5 w-3.5" />
                      {selectedStations.length} selected
                    </div>
                  )}
                </div>
                <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </CardHeader>
              <CardContent className="relative pt-3">
                {!isStationSelectionAvailable() ? (
                  <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                    <Lock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-300">
                      Complete customer information to unlock station selection
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sport Selection for Multi Sport Turf - Inline */}
                    {pendingStationId && showSportSelectionDialog && (
                      <div className="rounded-xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Trophy className="h-5 w-5 text-emerald-300" />
                          <h3 className="text-white font-semibold">Select Sport for Multi Sport Turf</h3>
                        </div>
                        <p className="text-gray-200 text-sm mb-4">
                          Please select which sport you want to play on Multi Sport Turf
                        </p>
                        <div className="space-y-3 mb-4">
                          <RadioGroup value={selectedSport} onValueChange={(value: 'cricket' | 'football') => setSelectedSport(value)}>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 hover:bg-white/10 cursor-pointer transition-colors bg-white/5">
                              <RadioGroupItem value="cricket" id="cricket" className="border-emerald-400 text-emerald-300" />
                              <Label htmlFor="cricket" className="text-white font-medium cursor-pointer flex-1">
                                Cricket
                              </Label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-white/20 hover:bg-white/10 cursor-pointer transition-colors bg-white/5">
                              <RadioGroupItem value="football" id="football" className="border-emerald-400 text-emerald-300" />
                              <Label htmlFor="football" className="text-white font-medium cursor-pointer flex-1">
                                Football
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowSportSelectionDialog(false);
                              setPendingStationId(null);
                            }}
                            className="flex-1 rounded-xl bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSportSelectionConfirm}
                            className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          >
                            Confirm
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="rounded-2xl border border-white/20 p-3 sm:p-4 bg-white/6">
                      <StationSelector
                        stations={stations}
                        selectedStations={selectedStations}
                        onStationToggle={handleStationToggle}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl shadow-green-500/20 transition-all duration-300 hover:shadow-green-500/40 hover:shadow-2xl hover:border-emerald-400/30 group">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 ring-1 ring-white/20 flex items-center justify-center group-hover:bg-emerald-500/30 group-hover:ring-emerald-400/50 transition-all duration-300">
                    {!isTimeSelectionAvailable() ? (
                      <Lock className="h-4 w-4 text-gray-300 group-hover:text-gray-200 transition-colors" />
                    ) : (
                      <CalendarIcon className="h-4 w-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    )}
                  </div>
                  Step 3: Choose Date & Time
                  {isTimeSelectionAvailable() && selectedSlot && (
                    <CheckCircle className="h-5 w-5 text-emerald-300 ml-auto" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!isTimeSelectionAvailable() ? (
                  <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                    <Lock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-300">
                      Select stations to unlock date and time selection
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium text-white">
                        Choose Date
                      </Label>
                      <div className="mt-2">
                        <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm p-3">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const compareDate = new Date(date);
                              compareDate.setHours(0, 0, 0, 0);
                              
                              return compareDate < today;
                            }}
                            className="text-white"
                            classNames={{
                              months: "text-white",
                              month: "text-white",
                              caption: "flex justify-center pt-1 relative items-center text-white",
                              caption_label: "text-sm font-medium text-white",
                              nav: "space-x-1 flex items-center",
                              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border-white/20 hover:bg-white/10",
                              nav_button_previous: "absolute left-1",
                              nav_button_next: "absolute right-1",
                              table: "w-full border-collapse space-y-1",
                              head_row: "flex",
                              head_cell: "text-gray-300 rounded-md w-8 sm:w-9 font-normal text-[0.8rem] flex items-center justify-center",
                              row: "flex w-full mt-2",
                              cell: "h-8 w-8 sm:h-9 sm:w-9 text-center text-sm p-0 relative",
                              day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal text-xs sm:text-sm text-white hover:bg-white/20 hover:text-white rounded-md",
                              day_range_end: "day-range-end",
                              day_selected: "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-500 focus:text-white rounded-md",
                              day_today: "bg-white/10 text-white border border-emerald-400/50 rounded-md font-semibold",
                              day_outside: "text-gray-500 opacity-50",
                              day_disabled: "text-gray-600 opacity-30 cursor-not-allowed",
                              day_range_middle: "bg-white/5 text-white",
                              day_hidden: "invisible",
                            }}
                            components={{
                              IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4 text-white" {...props} />,
                              IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4 text-white" {...props} />,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    {selectedStations.length > 0 && (
                      <div>
                        <Label className="text-base font-medium text-white">
                          Available Time Slots
                        </Label>
                        <div className="mt-2">
                        <TimeSlotPicker
                          slots={availableSlots}
                          selectedSlot={selectedSlot}
                          selectedSlotRange={selectedSlotRange}
                          onSlotSelect={handleSlotSelect}
                          loading={slotsLoading}
                          payAtVenueEnabled={payAtVenueEnabled}
                          singleSlotOnly={true}
                        />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl shadow-green-500/20">
              <CardHeader>
                <CardTitle className="text-white">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStations.length > 0 && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-300 uppercase">
                      Selected Stations
                    </Label>
                    <div className="mt-2 space-y-1">
                      {selectedStations.map((id) => {
                        const s = stations.find((x) => x.id === id);
                        if (!s) return null;
                        return (
                          <div key={id} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-white/20 flex items-center justify-center">
                              {s.type === "turf" ? (
                                <Trophy className="h-3.5 w-3.5 text-green-500" />
                              ) : s.type === "pickleball" ? (
                                <Target className="h-3.5 w-3.5 text-blue-400" />
                              ) : (
                                <Timer className="h-3.5 w-3.5 text-gray-300" />
                              )}
                            </div>
                            <Badge className="bg-white/10 border-white/20 backdrop-blur-sm text-white rounded-full px-2.5 py-1">
                              {s.name}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-300 uppercase">
                      Date
                    </Label>
                    <p className="mt-1 text-sm text-white">
                      {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                )}

                {selectedSlot && (
                  <div>
                    <Label className="text-xs font-semibold text-gray-300 uppercase">
                      Session Duration & Time
                    </Label>
                    <p className="mt-1 text-sm text-white">
                      {selectedSlotRange.length > 1 
                        ? `${selectedSlotRange.length} hour${selectedSlotRange.length > 1 ? 's' : ''} (${selectedSlotRange.length} slot${selectedSlotRange.length > 1 ? 's' : ''})`
                        : '1 hour'}
                    </p>
                    <p className="text-sm text-white">
                      {new Date(`2000-01-01T${selectedSlotRange[0]?.start_time || selectedSlot.start_time}`).toLocaleTimeString(
                        "en-US",
                        { hour: "numeric", minute: "2-digit", hour12: true }
                      )}{" "}
                      —{" "}
                      {(() => {
                        const endTime = selectedSlotRange[selectedSlotRange.length - 1]?.end_time || selectedSlot.end_time;
                        // Display 23:59:59 as "12:00 AM" for user clarity
                        if (endTime === '23:59:59' || endTime === '23:59:59.000') {
                          return '12:00 AM';
                        }
                        return new Date(`2000-01-01T${endTime}`).toLocaleTimeString(
                          "en-US",
                          { hour: "numeric", minute: "2-digit", hour12: true }
                        );
                      })()}
                    </p>
                  </div>
                )}

                {/* Coupon Code Section */}
                <div>
                  <Label className="text-xs font-semibold text-gray-300 uppercase">
                    Coupon Code
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-xl flex-1"
                    />
                    <Button
                      onClick={handleCouponApply}
                      size="sm"
                      className="rounded-xl bg-green-600 hover:bg-green-700"
                    >
                      Apply
                    </Button>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-300">
                    All discounts and totals are calculated in INR (₹).
                  </p>

                  {Object.entries(appliedCoupons).length > 0 && (
                    <div className="mt-2 space-y-2">
                      {Object.entries(appliedCoupons).map(([key, val]) => {
                        let emoji = "🏷️";
                        if (val === "HH99") emoji = "⏰";
                        else if (val === "NIT50") emoji = "🎓";
                        else if (val === "NerfTurf25") emoji = "🎉";
                        else if (val === "NerfTurf50") emoji = "📚";
                        else if (val === "ALMA50") emoji = "🏫";
                        else if (val === "AXEIST") emoji = "🥷";
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between px-4 py-2 rounded-xl shadow-sm font-semibold"
                            style={{
                              background: "linear-gradient(90deg,#231743 10%,#181121 100%)",
                              border: "1px solid #A37CFF",
                              color: "#F7CBFF",
                              letterSpacing: "1.5px"
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{emoji}</span>
                              <span className="font-extrabold uppercase tracking-widest">{val}</span>
                              <span className="ml-2 text-xs font-semibold text-emerald-300">
                                Applied!
                              </span>
                            </div>
                            <button
                              onClick={() => removeCoupon(key)}
                              aria-label="Remove coupon"
                              className="ml-2 p-1 hover:bg-green-900/30 rounded-full"
                            >
                              <X className="h-4 w-4 text-green-300" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <Label className="text-xs font-semibold text-gray-300 uppercase">
                    Payment Method
                  </Label>
                  <div className="mt-2">
                    {payAtVenueEnabled ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPaymentMethod("venue")}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm border transition-colors",
                            paymentMethod === "venue"
                              ? "bg-green-100 border-green-300 text-white"
                              : "bg-white/10 border-white/20 backdrop-blur-sm text-gray-200 hover:bg-white/20"
                          )}
                        >
                          Pay at Venue
                        </button>
                        <button
                          onClick={() => setPaymentMethod("razorpay")}
                          className={cn(
                            "rounded-lg px-3 py-2 text-sm border transition-colors",
                            paymentMethod === "razorpay"
                              ? "bg-blue-500/20 border-blue-500/30 text-white"
                              : "bg-white/10 border-white/20 backdrop-blur-sm text-gray-200 hover:bg-white/20"
                          )}
                        >
                          Pay Online
                        </button>
                      </div>
                    ) : (
                      /* Razorpay Payment Option */
                      <div className="rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-400" />
                            <span className="text-sm font-semibold text-white">Pay Online</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-blue-400">Razorpay</span>
                            <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
                              <span className="text-[8px] text-white font-bold">✓</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-200 leading-relaxed">
                          Secure payment powered by <span className="font-semibold text-blue-400">Razorpay</span>. 
                          Accepts all major credit/debit cards, UPI, netbanking, and digital wallets.
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-300">
                          <div className="flex items-center gap-1">
                            <div className="h-3 w-3 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                              <span className="text-[6px] text-emerald-300">🔒</span>
                            </div>
                            <span>SSL Secured</span>
                          </div>
                          <span>•</span>
                          <span>PCI DSS Compliant</span>
                          <span>•</span>
                          <span>Instant Confirmation</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {originalPrice > 0 && (
                  <>
                    <Separator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-gray-200">Subtotal</Label>
                        <span className="text-sm text-white">
                          {INR(originalPrice)}
                        </span>
                      </div>

                      {/* Discount Breakdown - Hidden for now */}
                      {discount > 0 && (
                        <div className="hidden">
                          <div className="border p-2 rounded bg-green-50 text-emerald-300">
                            <Label className="font-semibold text-xs uppercase">
                              Discount Breakdown
                            </Label>
                            <ul className="list-disc ml-5 mt-1 text-sm">
                              {Object.entries(discountBreakdown).map(([k, v]) => (
                                <li key={k}>
                                  {k}: -{INR(v)}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex justify-between items-center">
                            <Label className="text-sm text-emerald-300">
                              Total Discount
                            </Label>
                            <span className="text-sm text-emerald-300">-{INR(discount)}</span>
                          </div>
                        </div>
                      )}

                      <Separator className="bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                      <div className="flex justify-between items-center">
                        <Label className="text-base font-semibold text-white">
                          Total Amount
                        </Label>
                        <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                          {INR(finalPrice)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleConfirm}
                  disabled={
                    !selectedSlot || selectedStations.length === 0 || !customerNumber || !hasMinimumSlots || loading
                  }
                  className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  size="lg"
                >
                  {loading
                    ? paymentMethod === "venue" 
                      ? "Confirming Booking..."
                      : "Starting Payment..."
                    : paymentMethod === "venue"
                    ? "Confirm Booking (Pay at Venue)"
                    : "Confirm & Pay Online"}
                </Button>
                

                <p className="text-xs text-gray-300 text-center">
                  All prices are shown in <span className="font-semibold">INR (₹)</span>.{" "}
                  {paymentMethod === "venue" 
                    ? "Payment will be collected at the venue."
                    : <>You will complete payment securely via <span className="font-semibold text-blue-400">Razorpay</span>.</>}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
            <h3 className="text-white font-semibold mb-2">
              Terms & Conditions (Summary)
            </h3>
            <ul className="ml-5 list-disc text-sm text-gray-200 space-y-1.5">
              <li>Bookings are for specified time slots (1 hour for Football/Cricket/Pickleball); extensions subject to availability.</li>
              <li>Arrive on time; late arrivals may reduce play time without fee adjustment.</li>
              <li>Damage to equipment may incur charges as per in-store policy.</li>
              <li>Management may refuse service in cases of misconduct or safety concerns.</li>
              <li>All prices are in <strong>INR (₹)</strong>.</li>
            </ul>
            <button
              onClick={() => {
                setLegalDialogType("terms");
                setShowLegalDialog(true);
              }}
              className="mt-3 text-sm text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              View full Terms & Conditions
            </button>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
            <h3 className="text-white font-semibold mb-2">Privacy Policy (Summary)</h3>
            <ul className="ml-5 list-disc text-sm text-gray-200 space-y-1.5">
              <li>We collect minimal personal data (name, phone, optional email).</li>
              <li>Data is stored securely and used only for bookings/updates.</li>
              <li>No selling of data; limited sharing only to fulfill your booking.</li>
              <li>Contact us to correct or delete your data.</li>
            </ul>
            <button
              onClick={() => {
                setLegalDialogType("privacy");
                setShowLegalDialog(true);
              }}
              className="mt-3 text-sm text-emerald-300 hover:text-emerald-200 hover:underline"
            >
              View full Privacy Policy
            </button>
          </div>
        </section>

        <div className="mt-10">
          <Card className="bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-300" />
                Today's Bookings
              </CardTitle>
              <span className="text-xs text-gray-200 rounded-full border border-white/20 px-2 py-0.5 bg-white/10">
                {todayRows.length} total
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayLoading ? (
                <div className="h-12 rounded-md bg-white/5 animate-pulse" />
              ) : groupedByTime.length === 0 ? (
                <div className="text-sm text-gray-300">No bookings today.</div>
              ) : (
                groupedByTime.map(([timeLabel, rows]) => (
                  <details
                    key={timeLabel}
                    className="group rounded-xl border border-white/20 bg-white/10 open:bg-white/15 backdrop-blur-sm"
                  >
                    <summary className="list-none cursor-pointer select-none px-3 sm:px-4 py-3 sm:py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <Clock className="h-4 w-4 text-emerald-300" />
                        <span className="font-medium">{timeLabel}</span>
                      </div>
                      <span className="text-xs text-gray-200 rounded-full border border-white/20 px-2 py-0.5">
                        {rows.length} booking{rows.length !== 1 ? "s" : ""}
                      </span>
                    </summary>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 overflow-x-auto">
                      <table className="min-w-[520px] w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-300">
                            <th className="py-2 pr-3 font-medium">Customer</th>
                            <th className="py-2 pr-3 font-medium">Station</th>
                            <th className="py-2 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.id} className="border-t border-white/20">
                              <td className="py-2 pr-3">
                                <div className="text-white">{r.customerName}</div>
                                <div className="text-xs text-gray-300">{r.customerPhone}</div>
                              </td>
                              <td className="py-2 pr-3">
                                <Badge className="bg-white/10 border-white/20 backdrop-blur-sm text-white rounded-full">
                                  {r.stationName}
                                </Badge>
                              </td>
                              <td className="py-2">{statusChip(r.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-10 px-4 sm:px-6 md:px-8 border-t border-white/20 backdrop-blur-md bg-gradient-to-br from-white/10 via-white/5 to-white/10 relative z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
              <img
                src="/Turf45_transparent.png"
                alt="TURF 45 Logo"
                className="h-8 mr-3 cursor-pointer transition-transform hover:scale-105"
                style={{
                  filter: "drop-shadow(0 0 10px rgba(16, 185, 129, 0.5)) drop-shadow(0 0 5px rgba(16, 185, 129, 0.3))",
                }}
                onClick={() => setShowPinDialog(true)}
                title="Click for secret feature"
              />
              <p className="text-gray-300 text-sm">
                © {new Date().getFullYear()} Turf45. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-300 text-sm">
                <Clock className="h-4 w-4 text-gray-300 mr-1.5" />
                <span>Book anytime, anywhere</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap justify-center md:justify-start gap-6">
              <a
                href="/terms"
                className="text-gray-300 hover:text-white hover:underline text-sm flex items-center gap-1 transition"
              >
                Terms & Conditions
              </a>
              <a
                href="/privacy"
                className="text-gray-300 hover:text-white hover:underline text-sm flex items-center gap-1 transition"
              >
                Privacy Policy
              </a>
              <a
                href="/support"
                className="text-gray-300 hover:text-white hover:underline text-sm flex items-center gap-1 transition"
              >
                Contact Us
              </a>
              <a
                href="/refund-policy"
                className="text-gray-300 hover:text-white hover:underline text-sm flex items-center gap-1 transition"
              >
                Refund Policy
              </a>
              <a
                href="/login"
                className="text-gray-300 hover:text-white hover:underline text-sm flex items-center gap-2 transition"
              >
                <LogIn className="h-4 w-4" />
                Management Login
              </a>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <a href="tel:+919159991592" className="hover:text-white transition-colors">
                  +91 91599 91592
                </a>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@turf45.in" className="hover:text-white transition-colors">
                  contact@turf45.in
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-300">Powered by</p>
              <a 
                href="https://cuephoriatech.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 hover:text-emerald-200 transition-all text-sm font-medium"
              >
                <span>&lt; &gt;</span>
                <span className="text-emerald-300">Cuephoria</span>
                <span className="text-gray-200">Tech</span>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {bookingConfirmationData && (
        <BookingConfirmationDialog 
          isOpen={showConfirmationDialog}
          onClose={() => setShowConfirmationDialog(false)}
          bookingData={bookingConfirmationData}
        />
      )}


      <LegalDialog 
        isOpen={showLegalDialog}
        onClose={() => setShowLegalDialog(false)}
        type={legalDialogType}
      />

      {showRefundDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/20 bg-[#0c0c13] p-5 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Refund & Cancellation Policy</h3>
              <button
                aria-label="Close refund policy"
                onClick={() => setShowRefundDialog(false)}
                className="rounded-md p-1 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="prose prose-invert max-w-none text-sm text-gray-200">
              <p className="text-gray-300">
                This policy outlines how a booking for a gaming service made through the Platform can be canceled or refunded.
              </p>
              
              <h4 className="mt-4 text-white">Cancellations</h4>
              <ul className="ml-5 list-disc">
                <li>Requests must be made within <strong>1 day</strong> of placing the booking.</li>
                <li>Cancellation may not be possible if the session is already confirmed or about to commence.</li>
              </ul>

              <h4 className="mt-4 text-white">Non-Cancellable Services</h4>
              <ul className="ml-5 list-disc">
                <li>No cancellations for time-sensitive or non-refundable bookings.</li>
                <li>Refunds/rescheduling may be considered if the session wasn't provided as described.</li>
              </ul>

              <h4 className="mt-4 text-white">Service Quality Issues</h4>
              <ul className="ml-5 list-disc">
                <li>Report issues within <strong>1 day</strong> of the scheduled session.</li>
              </ul>

              <h4 className="mt-4 text-white">Refund Processing</h4>
              <ul className="ml-5 list-disc">
                <li>If approved, refunds are processed within <strong>3 days</strong> to the original payment method.</li>
              </ul>

              <p className="mt-4 text-xs text-gray-300">
                Need help? Call{' '}
                <a className="underline hover:text-white" href="tel:+919159991592">
                  +91 91599 91592
                </a>{' '}
                or email{' '}
                <a className="ml-1 underline hover:text-white" href="mailto:contact@nerfturf.in">
                  contact@nerfturf.in
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      <PublicBookingUnavailableDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
      />

      {/* Secret PIN Dialog */}
      {showPinDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="max-w-md w-full rounded-2xl border border-white/20 bg-[#0c0c13] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Enter Secret PIN</h3>
              <button
                aria-label="Close PIN dialog"
                onClick={() => {
                  setShowPinDialog(false);
                  setPinInput("");
                }}
                className="rounded-md p-1 text-gray-300 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-gray-200 mb-2 block">PIN</Label>
                <Input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 4) {
                      setPinInput(value);
                    }
                  }}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-300 rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && pinInput.length === 4) {
                      if (pinInput === '1342') {
                        setPayAtVenueEnabled(true);
                        setPaymentMethod("venue");
                        toast.success("🎉 Secret feature unlocked! Pay at Venue option enabled.");
                        setShowPinDialog(false);
                        setPinInput("");
                      } else {
                        toast.error("❌ Invalid PIN. Please try again.");
                        setPinInput("");
                      }
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPinDialog(false);
                    setPinInput("");
                  }}
                  className="flex-1 rounded-xl bg-white/90 border-white/20 text-gray-200 hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (pinInput === '1342') {
                      setPayAtVenueEnabled(true);
                      setPaymentMethod("venue");
                      toast.success("🎉 Secret feature unlocked! Pay at Venue option enabled.");
                      setShowPinDialog(false);
                      setPinInput("");
                    } else {
                      toast.error("❌ Invalid PIN. Please try again.");
                      setPinInput("");
                    }
                  }}
                  disabled={pinInput.length !== 4}
                  className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
