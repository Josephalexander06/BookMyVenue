"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useVenue,
  useVenueTimeslots,
  useUpdateVenueTimeslots,
} from "@/features/venues/hooks";
import { ArrowLeft, Clock, Save, Sparkles, Check, AlertCircle } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/dashboard/owner", label: "Overview" },
  { href: "/dashboard/owner/venues", label: "Venues" },
  { href: "/dashboard/owner/bookings", label: "Bookings" },
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate hours options for select dropdowns: 0 to 24
const TIME_HOURS = Array.from({ length: 25 }, (_, i) => {
  const hour = i;
  let label = "";
  if (hour === 0 || hour === 24) label = "12:00 AM";
  else if (hour === 12) label = "12:00 PM";
  else if (hour > 12) label = `${hour - 12}:00 PM`;
  else label = `${hour}:00 AM`;
  return { label, value: hour };
});

interface DaySlot {
  day_of_week: string;
  enabled: boolean;
  opens: number;
  closes: number;
  price_per_day?: number;
  price_per_hour?: number;
}

export default function VenueTimeslotPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;

  const { data: venue, isLoading: venueLoading } = useVenue(venueId);
  const { data: existingSlots, isLoading: slotsLoading } = useVenueTimeslots(venueId);
  const updateTimeslots = useUpdateVenueTimeslots();

  const [slots, setSlots] = useState<DaySlot[]>(
    DAYS_OF_WEEK.map((day) => ({
      day_of_week: day,
      enabled: true,
      opens: 9, // Model default: 9:00 AM
      closes: 23, // Model default: 10:00 AM
      price_per_day: 1000,
      price_per_hour: 200,
    }))
  );

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Populate slots state once existingSlots are loaded
  useEffect(() => {
    if (existingSlots && existingSlots.length > 0) {
      const mapped = DAYS_OF_WEEK.map((day) => {
        const found = existingSlots.find((s) => s.day_of_week.toLowerCase() === day.toLowerCase());
        if (found) {
          return {
            day_of_week: day,
            enabled: true,
            opens: found.opens,
            closes: found.closes,
            price_per_day: found.price_per_day ?? 1000,
            price_per_hour: found.price_per_hour ?? 120,
          };
        } else {
          return {
            day_of_week: day,
            enabled: false,
            opens: 9,
            closes: 10,
            price_per_day: 1000,
            price_per_hour: 120,
          };
        }
      });
      setSlots(mapped);
    }
  }, [existingSlots]);

  const handleToggleDay = (idx: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleChangeHours = (idx: number, field: "opens" | "closes", val: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  const handleChangePrice = (idx: number, field: "price_per_day" | "price_per_hour", val: number) => {
    setSlots((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s))
    );
  };

  // Preset: Model Defaults (9:00 AM - 10:00 AM)
  const applyModelDefaults = () => {
    setSlots(
      DAYS_OF_WEEK.map((day) => ({
        day_of_week: day,
        enabled: true,
        opens: 9,
        closes: 10,
        price_per_day: 1000,
        price_per_hour: 120,
      }))
    );
  };

  // Preset: Standard Business Hours (9:00 AM - 10:00 PM)
  const applyStandardHours = () => {
    setSlots(
      DAYS_OF_WEEK.map((day) => ({
        day_of_week: day,
        enabled: true,
        opens: 9,
        closes: 22,
        price_per_day: 1000,
        price_per_hour: 120,
      }))
    );
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSaveSuccess(false);

    // Validate times: opens must be less than closes for enabled days
    for (const slot of slots) {
      if (slot.enabled && slot.opens >= slot.closes) {
        setErrorMsg(`Invalid operating hours for ${slot.day_of_week}: Open time must be earlier than Close time.`);
        return;
      }
    }

    // Map only enabled days
    const payload = slots
      .filter((s) => s.enabled)
      .map((s) => ({
        day_of_week: s.day_of_week,
        opens: s.opens,
        closes: s.closes,
        price_per_day: s.price_per_day ?? 1000,
        price_per_hour: s.price_per_hour ?? 120,
      }));

    if (payload.length === 0) {
      setErrorMsg("Please select at least one day of the week to enable operating hours.");
      return;
    }

    try {
      await updateTimeslots.mutateAsync({ id: venueId, timeslots: payload });
      setSaveSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/owner/venues");
      }, 1500);
    } catch (err: any) {
      setErrorMsg("Failed to save timeslots. Please try again.");
    }
  };

  if (venueLoading || slotsLoading) {
    return (
      <div className="space-y-8 font-sans">
        <DashboardSidebar links={links} />
        <div className="p-6 md:p-8 space-y-6">
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-10 w-96 rounded-md" />
          <Card className="rounded-2xl border-slate-100 bg-white">
            <CardHeader>
              <Skeleton className="h-6 w-64 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isSetupIncomplete = !venue?.timeslots_setup_completed;

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 pb-16 font-sans text-slate-800">
      <DashboardSidebar links={links} />

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/dashboard/owner/venues"
          className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Venues
        </Link>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[#0052ff] uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Venue Management
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
              Configure Operating Hours
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Set the weekly timeslot schedule for <span className="font-semibold text-slate-700">{venue?.name}</span>.
            </p>
          </div>
        </div>

        {/* Alert Banner if incomplete */}
        {isSetupIncomplete && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs text-amber-800 flex gap-3 shadow-sm">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold block">Venue Listing is Incomplete</span>
              <p className="text-slate-600 font-medium">
                To list your venue as bookable, you must set and save operating timeslots. Save the schedule below to complete this process.
              </p>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <Card className="rounded-2xl border-slate-100 bg-white shadow-soft overflow-hidden">
          <CardHeader className="border-b border-slate-50 pb-4 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Weekly Operating Schedule
                </CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose default presets or customize opening and closing times for each day.
                </p>
              </div>

              {/* Presets Row */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyModelDefaults}
                  className="rounded-lg text-[10px] h-8 font-bold border-slate-200 hover:bg-slate-50"
                >
                  Model Defaults (9AM - 10AM)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyStandardHours}
                  className="rounded-lg text-[10px] h-8 font-bold border-slate-200 hover:bg-slate-50"
                >
                  Standard Hours (9AM - 10PM)
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {slots.map((slot, idx) => (
              <div
                key={slot.day_of_week}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${slot.enabled
                  ? "border-slate-150 bg-white shadow-sm"
                  : "border-slate-100 bg-slate-50/40 opacity-70"
                  }`}
              >
                {/* Day label & Toggle */}
                <div className="flex items-center gap-3 min-w-[150px]">
                  <input
                    type="checkbox"
                    id={`toggle-${slot.day_of_week}`}
                    checked={slot.enabled}
                    onChange={() => handleToggleDay(idx)}
                    className="h-4 w-4 rounded border-slate-300 text-[#0052ff] focus:ring-[#0052ff] transition-all cursor-pointer"
                  />
                  <label
                    htmlFor={`toggle-${slot.day_of_week}`}
                    className="text-sm font-bold text-slate-800 cursor-pointer select-none"
                  >
                    {slot.day_of_week}
                  </label>
                </div>

                {/* Dropdowns & Price inputs if enabled, otherwise Closed text */}
                {slot.enabled ? (
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Open Select */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">Opens</span>
                      <select
                        value={slot.opens}
                        onChange={(e) => handleChangeHours(idx, "opens", Number(e.target.value))}
                        className="h-9 w-28 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {TIME_HOURS.slice(0, 24).map((h) => (
                          <option key={`open-${h.value}`} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="text-slate-350 font-bold self-end mb-2">—</span>

                    {/* Close Select */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider">Closes</span>
                      <select
                        value={slot.closes}
                        onChange={(e) => handleChangeHours(idx, "closes", Number(e.target.value))}
                        className="h-9 w-28 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {TIME_HOURS.slice(1).map((h) => (
                          <option key={`close-${h.value}`} value={h.value}>
                            {h.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <span className="hidden md:inline text-slate-200">|</span>

                    {/* Price per day Input */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">Price/Day</span>
                      <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center h-9 w-24">
                        <span className="px-2 text-slate-400 text-[10px] font-bold border-r border-slate-200 bg-slate-50 h-full flex items-center">₹</span>
                        <input
                          type="number"
                          value={slot.price_per_day ?? ""}
                          onChange={(e) => handleChangePrice(idx, "price_per_day", Number(e.target.value))}
                          className="w-full text-xs font-bold text-slate-700 px-2 focus:outline-none border-none h-full bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Price per hour Input */}
                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-455 uppercase tracking-wider">Price/Hour</span>
                      <div className="relative rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center h-9 w-24">
                        <span className="px-2 text-slate-400 text-[10px] font-bold border-r border-slate-200 bg-slate-50 h-full flex items-center">₹</span>
                        <input
                          type="number"
                          value={slot.price_per_hour ?? ""}
                          onChange={(e) => handleChangePrice(idx, "price_per_hour", Number(e.target.value))}
                          className="w-full text-xs font-bold text-slate-700 px-2 focus:outline-none border-none h-full bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-150/20 sm:mr-10">
                    Closed
                  </span>
                )}
              </div>
            ))}

            {/* Error Message */}
            {errorMsg && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Alert */}
            {saveSuccess && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-bold text-emerald-600 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Schedule saved successfully! Redirecting...</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/owner/venues")}
                className="rounded-xl px-5 h-11 font-bold text-slate-650 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateTimeslots.isPending}
                className="rounded-xl px-6 h-11 bg-[#0052ff] hover:bg-[#004ced] text-white font-bold gap-2 shadow-md shadow-blue-500/10"
              >
                {updateTimeslots.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Schedule
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
