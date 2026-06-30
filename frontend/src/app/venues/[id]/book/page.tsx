"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/features/bookings/hooks";
import { useVenue, useBookedDates, useVenueTimeslots } from "@/features/venues/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Calendar, Info, MapPin, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrency } from "@/lib/utils";
import { createPaymentOrder, verifyPayment } from "@/features/bookings/api";
import { appConfig } from "@/lib/config";

const TIME_OPTIONS = [
  { label: "08:00 AM", value: "08:00" },
  { label: "09:00 AM", value: "09:00" },
  { label: "10:00 AM", value: "10:00" },
  { label: "11:00 AM", value: "11:00" },
  { label: "12:00 PM", value: "12:00" },
  { label: "01:00 PM", value: "13:00" },
  { label: "02:00 PM", value: "14:00" },
  { label: "03:00 PM", value: "15:00" },
  { label: "04:00 PM", value: "16:00" },
  { label: "05:00 PM", value: "17:00" },
  { label: "06:00 PM", value: "18:00" },
  { label: "07:00 PM", value: "19:00" },
  { label: "08:00 PM", value: "20:00" },
  { label: "09:00 PM", value: "21:00" },
  { label: "10:00 PM", value: "22:00" },
];

// Helper to construct timezone-aware ISO string in local browser time
const toLocalISOString = (dateObj: Date) => {
  const tzo = -dateObj.getTimezoneOffset();
  const dif = tzo >= 0 ? "+" : "-" ;
  const pad = (num: number) => String(Math.floor(Math.abs(num))).padStart(2, "0");
  const ms = String(dateObj.getMilliseconds()).padStart(3, "0");
  return (
    dateObj.getFullYear() +
    "-" +
    pad(dateObj.getMonth() + 1) +
    "-" +
    pad(dateObj.getDate()) +
    "T" +
    pad(dateObj.getHours()) +
    ":" +
    pad(dateObj.getMinutes()) +
    ":" +
    pad(dateObj.getSeconds()) +
    "." +
    ms +
    dif +
    pad(tzo / 60) +
    ":" +
    pad(tzo % 60)
  );
};

// Helper to parse timezone-aware datetime to local date YYYY-MM-DD
const getLocalDateString = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to format ISO date to readable string (e.g. "Jun 12, 2026")
const formatLocalDateReadable = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Helper to parse ISO datetime to local time HH:MM
const getLocalTimeString = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Helper to get all YYYY-MM-DD dates in a range
const getDatesInRange = (startIso: string, endIso: string) => {
  const dates: string[] = [];
  if (!startIso || !endIso) return dates;
  const start = new Date(startIso);
  const end = new Date(endIso);
  
  // Set times to midday to avoid timezone edge cases
  start.setHours(12, 0, 0, 0);
  end.setHours(12, 0, 0, 0);
  
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

// Helper to calculate days between two dates inclusive
const getDaysBetween = (startStr: string, endStr: string) => {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr + "T12:00:00");
  const end = new Date(endStr + "T12:00:00");
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

interface CalendarProps {
  mode: "DAILY" | "HOURLY";
  selectedDate?: string;
  onChangeSingle?: (date: string) => void;
  checkInDate?: string;
  checkOutDate?: string;
  onChangeRange?: (checkIn: string, checkOut: string | null) => void;
  bookedDates: string[];
  timeslots?: { day_of_week: string; opens: number; closes: number }[];
}

// Custom Premium Inline Calendar
function InlineCalendar({
  mode,
  selectedDate,
  onChangeSingle,
  checkInDate,
  checkOutDate,
  onChangeRange,
  bookedDates,
  timeslots,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const defaultDate = mode === "DAILY" ? checkInDate : selectedDate;
    return defaultDate ? new Date(defaultDate + "T12:00:00") : new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarCells = useMemo(() => {
    const cells: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({ dateStr: "", dayNum: 0, isPadding: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(month + 1).padStart(2, "0");
      const dStr = String(d).padStart(2, "0");
      cells.push({
        dateStr: `${year}-${mStr}-${dStr}`,
        dayNum: d,
        isPadding: false
      });
    }
    return cells;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const todayStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const isPrevDisabled = useMemo(() => {
    const today = new Date();
    return year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth());
  }, [year, month]);

  const maxDate = useMemo(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
  }, []);

  const maxDateStr = useMemo(() => {
    const y = maxDate.getFullYear();
    const m = String(maxDate.getMonth() + 1).padStart(2, "0");
    const d = String(maxDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [maxDate]);

  const isNextDisabled = useMemo(() => {
    return year > maxDate.getFullYear() || (year === maxDate.getFullYear() && month >= maxDate.getMonth());
  }, [year, month, maxDate]);

  const isCellDisabled = (dateStr: string) => {
    const isBooked = bookedDates.includes(dateStr);
    const isPast = dateStr < todayStr;
    const isFutureLimit = dateStr > maxDateStr;

    if (isBooked || isPast || isFutureLimit) return true;

    // Check if the venue is closed on this day of week
    if (timeslots && timeslots.length > 0) {
      const cellDate = new Date(dateStr + "T12:00:00");
      const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const cellDayName = weekdayNames[cellDate.getDay()];
      
      const isDayOperating = timeslots.some(
        (s) => s.day_of_week.toLowerCase() === cellDayName.toLowerCase()
      );
      if (!isDayOperating) return true;
    }

    if (mode === "DAILY" && checkInDate && !checkOutDate) {
      if (dateStr > checkInDate) {
        const range = getDatesInRange(checkInDate + "T00:00:00", dateStr + "T23:59:59");
        const hasBooked = range.some((d) => bookedDates.includes(d));
        if (hasBooked) return true;

        // Check if any date in the selection range is closed
        if (timeslots && timeslots.length > 0) {
          const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const hasClosedDay = range.some((dStr) => {
            const dObj = new Date(dStr + "T12:00:00");
            const dName = weekdayNames[dObj.getDay()];
            return !timeslots.some((s) => s.day_of_week.toLowerCase() === dName.toLowerCase());
          });
          if (hasClosedDay) return true;
        }
      }
    }

    return false;
  };

  const handleDayClick = (clickedDate: string) => {
    if (mode === "HOURLY") {
      onChangeSingle?.(clickedDate);
      return;
    }

    if (!checkInDate || (checkInDate && checkOutDate)) {
      onChangeRange?.(clickedDate, null);
    } else {
      if (clickedDate < checkInDate) {
        onChangeRange?.(clickedDate, null);
      } else {
        const range = getDatesInRange(checkInDate + "T00:00:00", clickedDate + "T23:59:59");
        const hasBooked = range.some((d) => bookedDates.includes(d));
        if (hasBooked) {
          onChangeRange?.(clickedDate, null);
        } else {
          onChangeRange?.(checkInDate, clickedDate);
        }
      }
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 shadow-soft max-w-sm">
      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h4 className="text-sm font-bold text-slate-800 font-sans">
          {MONTH_NAMES[month]} {year}
        </h4>
        <div className="flex gap-1.5">
          <button
            type="button"
            disabled={isPrevDisabled}
            onClick={prevMonth}
            className={`p-1 rounded-lg transition-colors text-sm font-bold w-7 h-7 flex items-center justify-center border border-slate-100 ${
              isPrevDisabled ? "opacity-30 cursor-not-allowed hover:bg-transparent" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            &lt;
          </button>
          <button
            type="button"
            disabled={isNextDisabled}
            onClick={nextMonth}
            className={`p-1 rounded-lg transition-colors text-sm font-bold w-7 h-7 flex items-center justify-center border border-slate-100 ${
              isNextDisabled ? "opacity-30 cursor-not-allowed hover:bg-transparent" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
            {day}
          </span>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarCells.map((cell, idx) => {
          if (cell.isPadding) {
            return <div key={`pad-${idx}`} className="aspect-square" />;
          }

          const isDisabled = isCellDisabled(cell.dateStr);
          const isBooked = bookedDates.includes(cell.dateStr);

          if (isBooked) {
            return (
              <div
                key={cell.dateStr}
                title="Booked Date"
                className="aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold bg-rose-50/30 border border-dashed border-rose-200 text-slate-350 cursor-not-allowed relative"
              >
                <span className="line-through decoration-dashed decoration-rose-400 font-sans">
                  {cell.dayNum}
                </span>
                <span className="absolute top-0.5 right-1 text-[8px] font-bold text-rose-500">
                  ⚠
                </span>
              </div>
            );
          }

          const isSelected = mode === "HOURLY"
            ? cell.dateStr === selectedDate
            : (cell.dateStr === checkInDate || cell.dateStr === checkOutDate);

          const isCheckIn = mode === "DAILY" && cell.dateStr === checkInDate;
          const isCheckOut = mode === "DAILY" && cell.dateStr === checkOutDate;
          const isInRange = mode === "DAILY" && checkInDate && checkOutDate && cell.dateStr > checkInDate && cell.dateStr < checkOutDate;

          let btnClass = "aspect-square flex items-center justify-center text-xs font-bold transition-all relative ";

          if (isDisabled) {
            btnClass += "text-slate-350 bg-slate-50/40 cursor-not-allowed";
          } else if (isSelected) {
            btnClass += "bg-[#F84464] text-white shadow-soft ";
            if (isCheckIn && checkOutDate && checkOutDate !== checkInDate) {
              btnClass += "rounded-l-xl rounded-r-none";
            } else if (isCheckOut && checkInDate && checkOutDate !== checkInDate) {
              btnClass += "rounded-r-xl rounded-l-none";
            } else {
              btnClass += "rounded-xl";
            }
          } else if (isInRange) {
            btnClass += "bg-rose-50/70 text-[#F84464] rounded-none hover:bg-rose-100/50";
          } else {
            btnClass += "text-slate-700 hover:bg-slate-100 rounded-xl";
          }

          return (
            <button
              key={cell.dateStr}
              type="button"
              disabled={isDisabled}
              onClick={() => handleDayClick(cell.dateStr)}
              className={btnClass}
            >
              <span className={isDisabled ? "line-through opacity-70" : ""}>
                {cell.dayNum}
              </span>
              {cell.dateStr === todayStr && !isSelected && !isInRange && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#F84464]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const createBooking = useCreateBooking();
  const { data: venue, isLoading: venueLoading } = useVenue(params.id);
  const { data: bookedSlots } = useBookedDates(venue?.id || params.id);
  const { data: timeslots } = useVenueTimeslots(venue?.id || params.id);

  const [bookingMode, setBookingMode] = useState<"DAILY" | "HOURLY">("DAILY");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Default to today's date formatted in local YYYY-MM-DD
  const [date, setDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [checkInDate, setCheckInDate] = useState(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [checkOutDate, setCheckOutDate] = useState<string | null>(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [showStartPop, setShowStartPop] = useState(false);
  const [showEndPop, setShowEndPop] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Close all calendar/time dropdowns when switching mode
  useEffect(() => {
    setShowCalendar(false);
    setShowStartPop(false);
    setShowEndPop(false);
  }, [bookingMode]);

  const venuePrice = venue?.pricing ?? 0;

  // Synchronize booking mode with the venue's allowed modes
  useEffect(() => {
    if (venue) {
      if (venue.allowedModes === "HOURLY") {
        setBookingMode("HOURLY");
      } else if (venue.allowedModes === "DAILY") {
        setBookingMode("DAILY");
      }
    }
  }, [venue]);

  // Synchronize date selection when switching modes
  useEffect(() => {
    if (bookingMode === "DAILY" && date) {
      setCheckInDate(date);
      setCheckOutDate(date);
    } else if (bookingMode === "HOURLY" && checkInDate) {
      setDate(checkInDate);
    }
  }, [bookingMode]);

  // Booked slots/intervals calculations
  const bookedIntervalsForSelectedDate = useMemo(() => {
    if (!date || !bookedSlots || bookingMode !== "HOURLY") return [];
    return bookedSlots
      .filter((slot) => {
        const slotDate = getLocalDateString(slot.start_time || slot.booking_date);
        return slotDate === date && slot.booking_mode === "HOURLY";
      })
      .map((slot) => {
        const startVal = getLocalTimeString(slot.start_time);
        const endVal = getLocalTimeString(slot.end_time);
        return { start: startVal, end: endVal };
      });
  }, [date, bookedSlots, bookingMode]);

  // List of all unavailable dates (fully booked days or days with daily bookings)
  const bookedDatesList = useMemo(() => {
    if (!bookedSlots) return [];
    const dates = new Set<string>();
    
    bookedSlots.forEach((slot) => {
      const start = slot.start_time || slot.booking_date;
      const end = slot.end_time || slot.booking_date;
      if (!start) return;
      
      const datesInSlot = getDatesInRange(start, end || start);
      
      if (bookingMode === "DAILY") {
        // In DAILY mode, any booking of any mode blocks the entire day
        datesInSlot.forEach(d => dates.add(d));
      } else {
        // In HOURLY mode, only DAILY bookings block the entire day
        if (slot.booking_mode === "DAILY") {
          datesInSlot.forEach(d => dates.add(d));
        }
      }
    });
    
    return Array.from(dates).sort();
  }, [bookedSlots, bookingMode]);

  const isDateConflict = useMemo(() => {
    if (bookingMode === "HOURLY") {
      return bookedDatesList.includes(date);
    }
    return false;
  }, [bookingMode, bookedDatesList, date]);

  // Helper to check if a specific hour is booked
  const isTimeBooked = (timeStr: string) => {
    return bookedIntervalsForSelectedDate.some(
      (interval) => timeStr >= interval.start && timeStr < interval.end
    );
  };

  // Filtered hours
  const filteredStartOptions = useMemo(() => {
    return TIME_OPTIONS.filter((opt) => !isTimeBooked(opt.value));
  }, [bookedIntervalsForSelectedDate]);

  const nextBookedStartTime = useMemo(() => {
    if (!startTime || bookedIntervalsForSelectedDate.length === 0) return null;
    const futureBookedStarts = bookedIntervalsForSelectedDate
      .map((interval) => interval.start)
      .filter((start) => start > startTime)
      .sort();
    return futureBookedStarts[0] || null;
  }, [startTime, bookedIntervalsForSelectedDate]);

  const filteredEndOptions = useMemo(() => {
    return TIME_OPTIONS.filter((opt) => {
      if (opt.value <= startTime) return false;
      if (nextBookedStartTime && opt.value > nextBookedStartTime) return false;
      return true;
    });
  }, [startTime, nextBookedStartTime]);

  // Reset selected times if they become unavailable
  useEffect(() => {
    if (bookingMode === "HOURLY" && filteredStartOptions.length > 0) {
      const exists = filteredStartOptions.some((opt) => opt.value === startTime);
      if (!exists) {
        setStartTime(filteredStartOptions[0].value);
      }
    }
  }, [filteredStartOptions, bookingMode, startTime]);

  useEffect(() => {
    if (bookingMode === "HOURLY" && filteredEndOptions.length > 0) {
      const exists = filteredEndOptions.some((opt) => opt.value === endTime);
      if (!exists) {
        setEndTime(filteredEndOptions[0].value);
      }
    }
  }, [filteredEndOptions, bookingMode, endTime]);

  // Check if a day in hourly mode has no slots left
  const isHourlyDayFullyBooked = useMemo(() => {
    return bookingMode === "HOURLY" && date !== "" && filteredStartOptions.length === 0;
  }, [bookingMode, date, filteredStartOptions]);

  const isBookingBlocked = useMemo(() => {
    if (bookingMode === "DAILY") {
      if (!checkInDate || !checkOutDate) return false;
      const range = getDatesInRange(checkInDate + "T00:00:00", checkOutDate + "T23:59:59");
      return range.some((d) => bookedDatesList.includes(d));
    } else {
      return Boolean(isDateConflict || isHourlyDayFullyBooked);
    }
  }, [bookingMode, checkInDate, checkOutDate, bookedDatesList, isDateConflict, isHourlyDayFullyBooked]);

  // Calculate hourly rate (use pricePerHour from venue or fallback to daily / 8)
  const hourlyRate = useMemo(() => {
    return venue?.pricePerHour ?? Math.round(venuePrice / 8);
  }, [venue, venuePrice]);

  // Calculate duration and base price
  const billingDetails = useMemo(() => {
    if (bookingMode === "DAILY") {
      const numDays = (checkInDate && checkOutDate) ? getDaysBetween(checkInDate, checkOutDate) : 1;
      const base = venuePrice * numDays;
      const fee = Math.round(base * 0.05);
      return {
        durationText: `${numDays} ${numDays === 1 ? "Day" : "Days"}`,
        rateText: `${formatCurrency(venuePrice)} / day`,
        basePrice: base,
        fee: fee,
        total: base + fee,
      };
    } else {
      const startIdx = TIME_OPTIONS.findIndex((t) => t.value === startTime);
      const endIdx = TIME_OPTIONS.findIndex((t) => t.value === endTime);
      const hours = Math.max(1, endIdx - startIdx);
      const base = hourlyRate * hours;
      const fee = Math.round(base * 0.05);
      return {
        durationText: `${hours} ${hours === 1 ? "Hour" : "Hours"}`,
        rateText: `${formatCurrency(hourlyRate)} / hour`,
        basePrice: base,
        fee: fee,
        total: base + fee,
      };
    }
  }, [bookingMode, venuePrice, hourlyRate, startTime, endTime, checkInDate, checkOutDate]);

  const handleRangeChange = (checkIn: string, checkOut: string | null) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    if (checkOut !== null) {
      setShowCalendar(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");

    if (isBookingBlocked) {
      setErrorMsg("This date/time slot is already booked. Please choose an available date or slot.");
      return;
    }

    if (bookingMode === "HOURLY") {
      const startIdx = TIME_OPTIONS.findIndex((t) => t.value === startTime);
      const endIdx = TIME_OPTIONS.findIndex((t) => t.value === endTime);
      if (startIdx >= endIdx) {
        setErrorMsg("End time must be after start time.");
        return;
      }
    } else {
      if (!checkInDate || !checkOutDate) {
        setErrorMsg("Please select a check-out date.");
        return;
      }
    }

    setIsProcessingPayment(true);

    try {
      // 1. Load Razorpay script dynamically
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Create Order on Backend
      const receiptId = `receipt_${venue?.id || params.id}_${Date.now()}`;
      const order = await createPaymentOrder(billingDetails.total, receiptId);

      if (!order || !order.id) {
        throw new Error("Failed to initialize payment order on the server.");
      }

      const currentUser = useAuthStore.getState().user;

      // 3. Setup Razorpay Options
      const options = {
        key: appConfig.razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "BookMyVenue",
        description: `Booking for ${venue?.name ?? "Venue"}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            setIsProcessingPayment(true);
            setErrorMsg("");

            // 4. Verify Payment on Backend
            const verification = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verification.status !== "success") {
              throw new Error("Payment verification failed. Please contact support.");
            }

            // 5. Create Booking Request
            let requestDate = date;
            let startIso: string | undefined = undefined;
            let endIso: string | undefined = undefined;

            if (bookingMode === "HOURLY") {
              const startDt = new Date(`${date}T${startTime}:00`);
              const endDt = new Date(`${date}T${endTime}:00`);
              requestDate = date;
              startIso = toLocalISOString(startDt);
              endIso = toLocalISOString(endDt);
            } else {
              const end = checkOutDate || checkInDate;
              const dailyDt = new Date(`${checkInDate}T00:00:00`);
              requestDate = checkInDate;
              startIso = toLocalISOString(dailyDt);
              const endDt = new Date(`${end}T23:59:59`);
              endIso = toLocalISOString(endDt);
            }

            await createBooking.mutateAsync({
              venueId: venue?.id || params.id,
              date: requestDate,
              attendees: 1,
              note: note || undefined,
              startTime: startIso,
              endTime: endIso,
              mode: bookingMode,
            });

            if (currentUser?.role === "admin") {
              router.push("/dashboard/admin/bookings");
            } else if (currentUser?.role === "owner") {
              router.push("/dashboard/owner/bookings");
            } else {
              router.push("/dashboard/customer");
            }
          } catch (err: any) {
            console.warn(err);
            const detail = err?.response?.data?.detail;
            setErrorMsg(
              typeof detail === "string"
                ? detail
                : err?.message ?? "Payment verified, but booking confirmation failed. Please contact support."
            );
          } finally {
            setIsProcessingPayment(false);
          }
        },
        prefill: {
          contact: currentUser?.phone || "",
        },
        theme: {
          color: "#F84464",
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
            setErrorMsg("Payment process was cancelled by user.");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setErrorMsg(response.error.description || "Payment failed. Please try again.");
        setIsProcessingPayment(false);
      });

      rzp.open();
    } catch (err: any) {
      console.warn(err);
      setIsProcessingPayment(false);
      const detail = err?.response?.data?.detail;
      setErrorMsg(
        typeof detail === "string"
          ? detail
          : err?.message ?? "Failed to initiate payment. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10">
      {/* Top back button */}
      <div className="mx-auto w-full max-w-5xl px-6 mb-8">
        <Link
          href={`/venues/${params.id}`}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#F84464] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to venue details
        </Link>
      </div>

      {/* Header */}
      <div className="mx-auto w-full max-w-5xl px-6 mb-10">
        {venueLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-9 w-80 rounded-xl" />
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#F84464] uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Secure Booking Checkout
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1.5">
              Confirm your booking
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Review details, choose availability, and submit your request.
            </p>
          </div>
        )}
      </div>

      {/* Main Split Layout */}
      <div className="mx-auto w-full max-w-5xl px-6 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        
        {/* Left Column: Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Booking Mode Selector (Only shown if venue allows BOTH) */}
            {(!venue || venue.allowedModes === "BOTH") ? (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Booking Mode
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookingMode("DAILY")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      bookingMode === "DAILY"
                        ? "bg-[#F84464] text-white shadow-soft"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    All Day Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode("HOURLY")}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                      bookingMode === "HOURLY"
                        ? "bg-[#F84464] text-white shadow-soft"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Clock className="h-4 w-4" />
                    Hourly Slots
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Booking Mode
                </label>
                <div className="text-xs font-bold text-slate-800 bg-slate-50/80 border border-slate-100 px-4 py-3.5 rounded-2xl flex items-center gap-2">
                  {venue.allowedModes === "HOURLY" ? (
                    <>
                      <Clock className="h-4 w-4 text-[#F84464]" />
                      Hourly Slots Booking
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 text-[#F84464]" />
                      All Day Booking
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Date Selection Dropdown Block */}
            {bookingMode === "DAILY" ? (
              <div className="space-y-3 relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Dates
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full grid grid-cols-2 rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-[#F84464]/45 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464] overflow-hidden text-left"
                  >
                    <div className="px-4 py-3 flex flex-col justify-center border-r border-slate-100">
                      <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider">
                        Check-in
                      </span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {checkInDate ? formatLocalDateReadable(checkInDate) : "Add date"}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider">
                        Check-out
                      </span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {checkOutDate ? formatLocalDateReadable(checkOutDate) : "Add date"}
                      </span>
                    </div>
                  </button>

                  {showCalendar && (
                    <div className="absolute left-0 top-full mt-2 z-20 w-full max-w-sm animate-fade-in bg-white">
                      <InlineCalendar
                        mode="DAILY"
                        checkInDate={checkInDate}
                        checkOutDate={checkOutDate || undefined}
                        onChangeRange={handleRangeChange}
                        bookedDates={bookedDatesList}
                        timeslots={timeslots}
                      />
                    </div>
                  )}
                </div>

                {/* Conflict Warnings */}
                {isBookingBlocked && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-bold text-rose-600 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Selected dates overlap with an existing booking. Please choose a different range.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Event Date
                </label>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalendar(!showCalendar);
                      setShowStartPop(false);
                      setShowEndPop(false);
                    }}
                    className="w-full flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm hover:border-[#F84464]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F84464]/20 focus:border-[#F84464]"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4.5 w-4.5 text-[#F84464]" />
                      <span className="text-sm font-bold text-slate-850">
                        {date ? formatLocalDateReadable(date) : "Choose a date..."}
                      </span>
                    </div>
                    <span className="text-xs text-[#F84464] font-bold">
                      {showCalendar ? "Close Calendar" : "Change Date"}
                    </span>
                  </button>

                  {showCalendar && (
                    <div className="absolute left-0 top-full mt-2 z-20 w-full max-w-sm animate-fade-in bg-white">
                      <InlineCalendar
                        mode="HOURLY"
                        selectedDate={date}
                        onChangeSingle={(d) => {
                          setDate(d);
                          setShowCalendar(false);
                        }}
                        bookedDates={bookedDatesList}
                        timeslots={timeslots}
                      />
                    </div>
                  )}
                </div>

                {/* Conflict Warnings */}
                {isDateConflict && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-bold text-rose-600 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>This date is fully booked. Please choose a different date.</span>
                  </div>
                )}

                {isHourlyDayFullyBooked && (
                  <div className="rounded-2xl bg-rose-50 border border-rose-100/50 p-4 text-xs font-bold text-rose-600 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>All hourly timeslots on this day are already booked.</span>
                  </div>
                )}
              </div>
            )}

            {/* Hourly Slot Selection */}
            {bookingMode === "HOURLY" && !isDateConflict && date && (
              <div className="space-y-3 relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Time Slot
                </label>
                
                <div className="relative">
                  <div className="w-full grid grid-cols-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-left">
                    {/* Start Time Box */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowStartPop(!showStartPop);
                        setShowEndPop(false);
                        setShowCalendar(false);
                      }}
                      className="px-4 py-3 flex flex-col justify-center border-r border-slate-100 hover:bg-slate-50/50 transition-colors text-left"
                    >
                      <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider">
                        Start Time
                      </span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {startTime ? TIME_OPTIONS.find(o => o.value === startTime)?.label : "Select time"}
                      </span>
                    </button>
                    
                    {/* End Time Box */}
                    <button
                      type="button"
                      disabled={!startTime}
                      onClick={() => {
                        setShowStartPop(false);
                        setShowEndPop(!showEndPop);
                        setShowCalendar(false);
                      }}
                      className="px-4 py-3 flex flex-col justify-center hover:bg-slate-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <span className="text-[10px] font-bold text-[#F84464] uppercase tracking-wider">
                        End Time
                      </span>
                      <span className="text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {endTime ? TIME_OPTIONS.find(o => o.value === endTime)?.label : "Select time"}
                      </span>
                    </button>
                  </div>

                  {/* Popover for Start Time Grid */}
                  {showStartPop && (
                    <div className="absolute left-0 top-full mt-2 z-20 w-full animate-fade-in bg-white border border-slate-200 rounded-3xl p-4 shadow-lg">
                      <div className="flex justify-between items-center mb-2.5 px-1">
                        <span className="text-xs font-bold text-slate-800">Select Start Time</span>
                        <button
                          type="button"
                          onClick={() => setShowStartPop(false)}
                          className="text-[10px] font-bold text-[#F84464]"
                        >
                          Done
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                        {TIME_OPTIONS.map((opt) => {
                          const isBooked = isTimeBooked(opt.value);
                          const isSelected = startTime === opt.value;
                          return (
                            <button
                              key={`start-pop-${opt.value}`}
                              type="button"
                              disabled={isBooked}
                              onClick={() => {
                                setStartTime(opt.value);
                                setShowStartPop(false);
                                setShowEndPop(true);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                                isSelected
                                  ? "bg-[#F84464] border-[#F84464] text-white shadow-soft"
                                  : isBooked
                                  ? "bg-slate-100/70 border-slate-200 text-slate-300 cursor-not-allowed line-through"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-[#F84464]/30 hover:bg-[#F84464]/5"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Popover for End Time Grid */}
                  {showEndPop && startTime && (
                    <div className="absolute left-0 top-full mt-2 z-20 w-full animate-fade-in bg-white border border-slate-200 rounded-3xl p-4 shadow-lg">
                      <div className="flex justify-between items-center mb-2.5 px-1">
                        <span className="text-xs font-bold text-slate-800">Select End Time</span>
                        <button
                          type="button"
                          onClick={() => setShowEndPop(false)}
                          className="text-[10px] font-bold text-[#F84464]"
                        >
                          Done
                        </button>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
                        {TIME_OPTIONS.map((opt) => {
                          const isAfterStart = opt.value > startTime;
                          const isPastNextBooked = nextBookedStartTime && opt.value > nextBookedStartTime;
                          const isValid = isAfterStart && !isPastNextBooked;
                          const isSelected = endTime === opt.value;

                          return (
                            <button
                              key={`end-pop-${opt.value}`}
                              type="button"
                              disabled={!isValid}
                              onClick={() => {
                                setEndTime(opt.value);
                                setShowEndPop(false);
                              }}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border ${
                                isSelected && isValid
                                  ? "bg-[#F84464] border-[#F84464] text-white shadow-soft"
                                  : !isValid
                                  ? "bg-slate-100/50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                  : "bg-white border-slate-200 text-slate-700 hover:border-[#F84464]/30 hover:bg-[#F84464]/5"
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Booking Notes <span className="text-[10px] font-normal text-slate-400 capitalize">(optional)</span>
              </label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Include special requests, equipment needs, or layout preferences..."
                rows={4}
                className="rounded-2xl border-slate-200 bg-white text-sm shadow-sm transition-shadow focus-visible:ring-[#F84464] p-4 placeholder:text-slate-400"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={createBooking.isPending || isProcessingPayment || (bookingMode === "HOURLY" ? !date : (!checkInDate || !checkOutDate)) || isBookingBlocked}
              className="w-full h-12 rounded-2xl bg-[#F84464] hover:bg-[#e03d5a] text-white text-sm font-bold shadow-soft transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isProcessingPayment 
                ? "Processing Payment..." 
                : createBooking.isPending 
                ? "Submitting Request..." 
                : "Pay & Confirm Booking Request"}
            </Button>
          </form>
        </div>

        {/* Right Column: Invoice/Summary Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-soft space-y-6">
            
            {/* Mini Venue visual */}
            {!venueLoading && venue && (
              <div className="flex gap-4 border-b border-slate-50 pb-5">
                <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  <img
                    src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                    alt={venue.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <h4 className="text-sm font-bold text-slate-850 truncate">{venue.name}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-0.5 mt-0.5 font-medium truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {venue.location}
                  </p>
                  {venue.capacity && (
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      Capacity: max {venue.capacity} guests
                    </p>
                  )}
                </div>
              </div>
            )}

            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-3">
              Booking Invoice Summary
            </h3>
            
            {/* Rates info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Duration:</span>
                <span className="font-bold text-slate-800 bg-slate-50 border border-slate-100 rounded-md px-2 py-0.5">
                  {billingDetails.durationText}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Base Rate:</span>
                <span className="font-bold text-slate-800">{billingDetails.rateText}</span>
              </div>
            </div>

            {/* Pricing math */}
            <div className="border-t border-slate-50 pt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium font-bold">Subtotal:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(billingDetails.basePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  Internet Handling Fee
                  <span title="5% platform booking service fee" className="cursor-help">
                    <Info className="h-3 w-3 text-slate-400" />
                  </span>
                </span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(billingDetails.fee)}
                </span>
              </div>
            </div>

            {/* Total invoice */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-850">Total Price:</span>
              <span className="text-lg font-extrabold text-[#F84464]">
                {formatCurrency(billingDetails.total)}
              </span>
            </div>
            
            {/* Warning block */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100/80 text-[11px] text-slate-400 leading-relaxed font-medium">
              * By booking, you submit a request directly to the host. You will only be billed once the host approves the booking.
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
