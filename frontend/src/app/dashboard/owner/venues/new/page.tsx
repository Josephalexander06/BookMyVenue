"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateVenue
} from "@/features/venues/hooks";
import { CreateVenuePayload, VenueType } from "@/types/venue";
import MapPicker from "@/components/ui/map-picker";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Info,
  Image as ImageIcon,
  CheckSquare,
  DollarSign,
  Eye,
  CheckCircle,
  Plus,
  Minus,
  MapPin,
  Trash2,
  Users,
  Wifi,
  Tv,
  Car,
  Wind,
  Music,
  Briefcase,
  X,
  Upload
} from "lucide-react";
import Link from "next/link";

const steps = [
  { id: "intro", label: "Welcome" },
  { id: "basics", label: "Basics" },
  { id: "photos", label: "Photos" },
  { id: "amenities", label: "Amenities" },
  { id: "pricing", label: "Pricing" },
  { id: "review", label: "Review" },
];

const venueTypes: { value: VenueType; label: string; description: string }[] = [
  { value: "meeting_room", label: "Meeting Room", description: "Perfect for conferences, workshops, and business discussions." },
  { value: "studio", label: "Studio", description: "Creative spaces for photoshoots, podcasts, dance, or art." },
  { value: "auditorium", label: "Auditorium", description: "Large halls for presentations, seminars, and theatrical shows." },
  { value: "community_center", label: "Community Center", description: "Versatile public venues for community meets and parties." },
  { value: "event_venue", label: "Event Venue", description: "Premium spaces tailored for weddings, galas, and social events." },
  { value: "cafe", label: "Café", description: "Cozy spaces for informal catch-ups, meetups, and open-mics." },
  { value: "convention_hall", label: "Convention Hall", description: "Massive venues designed for exhibitions, expos, and trade fairs." },
  { value: "outdoor", label: "Outdoor Space", description: "Open lawns, rooftops, or gardens for scenic events." },
];

const availableAmenities = [
  { id: "WiFi", label: "High-speed Wi-Fi", icon: Wifi },
  { id: "Projector", label: "Projector & Screen", icon: Tv },
  { id: "Parking", label: "On-site Parking", icon: Car },
  { id: "Air Conditioning", label: "Air Conditioning", icon: Wind },
  { id: "Sound Setup", label: "Sound Setup", icon: Music },
  { id: "Green Room", label: "Green Room", icon: Briefcase },
];

export default function NewVenueWizard() {
  const router = useRouter();
  const createVenue = useCreateVenue();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [form, setForm] = useState<CreateVenuePayload>({
    name: "",
    description: "",
    capacity: 25,
    location: "",
    latitude: undefined,
    longitude: undefined,
    type: "meeting_room",
    amenities: [],
    pricing: 1000,
    pricePerHour: 120,
    allowedModes: "BOTH",
  });

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((p) => p + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    setForm((p) => {
      const exists = p.amenities.includes(amenityId);
      return {
        ...p,
        amenities: exists
          ? p.amenities.filter((a) => a !== amenityId)
          : [...p.amenities, amenityId],
      };
    });
  };

  const submit = async () => {
    try {
      const createdVenue = await createVenue.mutateAsync({
        ...form,
        imageFiles: selectedFiles,
      });
      router.push(`/dashboard/owner/venues/${createdVenue.id}/timeslot`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Sidebar Navigation (Hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 shrink-0 border-r border-slate-150 bg-white flex-col justify-between p-6 h-screen sticky top-0">
        <div className="space-y-8">
          <Link href="/dashboard/owner/venues" className="text-xl font-bold tracking-tight text-slate-900 hover:text-slate-700">
            BookMyVenue
          </Link>
          <div className="space-y-1">
            <h2 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-3">Onboarding</h2>
            <nav className="space-y-1.5">
              {steps.map((step, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;
                return (
                  <button
                    key={step.id}
                    disabled={idx > currentStep}
                    onClick={() => setCurrentStep(idx)}
                    className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all border ${
                      isActive
                        ? "bg-[#0052ff]/5 border-[#0052ff]/10 text-[#0052ff]"
                        : isCompleted
                        ? "bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100"
                        : "border-transparent text-slate-450 cursor-not-allowed"
                    }`}
                  >
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black border ${
                      isActive
                        ? "bg-[#0052ff] border-[#0052ff] text-white"
                        : isCompleted
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "border-slate-200 text-slate-400"
                    }`}>
                      {idx}
                    </span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm("Are you sure you want to exit? Your changes will not be saved.")) {
              router.push("/dashboard/owner/venues");
            }
          }}
          className="w-full py-3 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:border-slate-350 text-xs font-bold transition-colors active:scale-[0.98]"
        >
          Save & Exit
        </button>
      </aside>

      {/* Mobile Header (Hidden on desktop) */}
      <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm flex items-center justify-between px-6 py-4">
        <span className="text-sm font-black text-slate-900">BookMyVenue</span>
        {currentStep > 0 && (
          <span className="text-xs font-bold text-slate-500">Step {currentStep} of 5</span>
        )}
        <button
          onClick={() => router.push("/dashboard/owner/venues")}
          className="text-xs font-bold text-slate-400 hover:text-slate-800"
        >
          Exit
        </button>
      </header>

      {/* Main Wizard Area Wrapper */}
      <div className="flex-grow flex flex-col justify-between min-h-screen">
        {currentStep > 0 && (
          <div className="w-full bg-slate-100 h-1 md:hidden">
            <div
              className="bg-[#0052ff] h-1 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        )}

        <main className="flex-grow flex flex-col items-center justify-center py-10 px-4 max-w-4xl mx-auto w-full">
        {currentStep === 0 && (
          <div className="w-full max-w-3xl space-y-8 text-center animate-fade-in py-8">
            <div className="inline-flex items-center justify-center p-3 bg-[#e2e7ff] text-[#0052ff] rounded-2xl">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Become a Host in Minutes
              </h1>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                Share your empty office, creative studio, garden, or hall with the community. You determine availability, pricing, and policies.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 text-left pt-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-[#0052ff] mb-4">
                  1
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Fill the basics</h3>
                <p className="text-xs text-slate-400">Describe your space, layout capacity, and pin your map location.</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-[#0052ff] mb-4">
                  2
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Add details</h3>
                <p className="text-xs text-slate-400">Showcase high-res photos and highlight specification details & amenities.</p>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-[#0052ff] mb-4">
                  3
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Start booking</h3>
                <p className="text-xs text-slate-400">Configure daily or hourly pricing models to accept requests.</p>
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={next}
                className="bg-[#0052ff] hover:bg-[#004ced] px-10 py-6 rounded-2xl text-white font-bold text-sm shadow-lg shadow-blue-500/25"
              >
                Let&apos;s Start Listing
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Basics */}
        {currentStep === 1 && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wide">Step 1 of 5</span>
              <h2 className="text-2xl font-bold text-slate-900">What kind of space are you listing?</h2>
              <p className="text-sm text-slate-500">Provide the fundamental details of your space so guests can find it.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">Venue Name</label>
                <Input
                  placeholder="e.g. Spacious Photographic Loft Studio"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">Description</label>
                <Textarea
                  placeholder="Tell potential guests what makes your venue special, ideal events, nearby amenities, and transportation..."
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">Space Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as VenueType }))}
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {venueTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-400">Seated Guest Capacity</label>
                  <div className="flex items-center justify-between border border-slate-200 rounded-xl px-4 h-11 bg-white">
                    <span className="text-sm font-semibold text-slate-700">{form.capacity} guests</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, capacity: Math.max(1, p.capacity - 5) }))}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, capacity: p.capacity + 5 }))}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">Address Location</label>
                <Input
                  placeholder="Enter the full address of your venue..."
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">Map Pin Location</label>
                <div className="rounded-xl overflow-hidden border border-slate-100">
                  <MapPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    defaultAddress={form.location}
                    onChange={(lat, lng) =>
                      setForm((p) => ({ ...p, latitude: lat, longitude: lng }))
                    }
                    onAddressChange={(address) =>
                      setForm((p) => ({ ...p, location: address }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Photos */}
        {currentStep === 2 && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wide">Step 2 of 5</span>
              <h2 className="text-2xl font-bold text-slate-900">Showcase your space with photos</h2>
              <p className="text-sm text-slate-500">Provide clear, bright images to attract potential guests.</p>
            </div>

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 bg-white hover:bg-slate-50/50 transition-colors duration-300 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[260px] group shadow-soft"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#e2e7ff] transition-colors">
                <Upload className="h-6 w-6 text-slate-400 group-hover:text-[#0052ff]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Upload photos of your space</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Drag and drop or browse to select JPG, PNG, or WEBP formats up to 8MB. We recommend at least 3 photos.
              </p>
            </div>

            {/* Image Preview Grid */}
            {selectedFiles.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Selected files ({selectedFiles.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-100 group shadow-sm bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors shadow"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <div className="absolute bottom-2 left-2 bg-[#0052ff] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                          Cover
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Amenities */}
        {currentStep === 3 && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wide">Step 3 of 5</span>
              <h2 className="text-2xl font-bold text-slate-900">What amenities does your space offer?</h2>
              <p className="text-sm text-slate-500">Highlight specifications and equipment to help guests run successful events.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-2">
                {availableAmenities.map((amenity) => {
                  const Icon = amenity.icon;
                  const isSelected = form.amenities.includes(amenity.id);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all duration-150 ${
                        isSelected
                          ? "border-[#0052ff] bg-[#0052ff]/5 text-[#0052ff] shadow-sm"
                          : "border-slate-100 hover:border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isSelected ? "bg-[#e2e7ff]" : "bg-slate-50"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-semibold">{amenity.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Pricing */}
        {currentStep === 4 && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wide">Step 4 of 5</span>
              <h2 className="text-2xl font-bold text-slate-900">Configure your booking pricing</h2>
              <p className="text-sm text-slate-500">Provide flexible daily and hourly rates depending on guest preferences.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-slate-400">Allowed Booking Mode</label>
                <select
                  value={form.allowedModes ?? "BOTH"}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      allowedModes: e.target.value as CreateVenuePayload["allowedModes"],
                    }))
                  }
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="BOTH">Both Daily & Hourly</option>
                  <option value="DAILY">Daily Booking Only (Airbnb style)</option>
                  <option value="HOURLY">Hourly Slots Only (BookMyShow style)</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(form.allowedModes === "DAILY" || form.allowedModes === "BOTH" || !form.allowedModes) && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Price per day (₹)</label>
                    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center h-11">
                      <div className="px-3 bg-slate-50 text-slate-400 h-full flex items-center border-r border-slate-200 font-bold text-sm">
                        ₹
                      </div>
                      <Input
                        type="number"
                        value={form.pricing}
                        onChange={(e) => setForm((p) => ({ ...p, pricing: Number(e.target.value) }))}
                        className="border-none focus-visible:ring-0 shadow-none h-full"
                      />
                    </div>
                  </div>
                )}

                {(form.allowedModes === "HOURLY" || form.allowedModes === "BOTH") && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-400">Price per hour (₹)</label>
                    <div className="relative rounded-xl border border-slate-200 bg-white overflow-hidden flex items-center h-11">
                      <div className="px-3 bg-slate-50 text-slate-400 h-full flex items-center border-r border-slate-200 font-bold text-sm">
                        ₹
                      </div>
                      <Input
                        type="number"
                        value={form.pricePerHour ?? Math.round(form.pricing / 8)}
                        onChange={(e) => setForm((p) => ({ ...p, pricePerHour: Number(e.target.value) }))}
                        className="border-none focus-visible:ring-0 shadow-none h-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="w-full max-w-3xl space-y-6 animate-fade-in">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-[#0052ff] uppercase tracking-wide">Step 5 of 5</span>
              <h2 className="text-2xl font-bold text-slate-900">Review your venue listing</h2>
              <p className="text-sm text-slate-500">Double check that all information is correct before publishing your venue.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-soft space-y-6">
              <div className="flex gap-4 items-start pb-4 border-b border-slate-50">
                <div className="h-20 w-24 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                  {selectedFiles.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(selectedFiles[0])}
                      alt={form.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{form.name || "Unnamed Venue"}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {form.location || "No address provided"}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue Type</span>
                  <span className="block text-sm font-semibold mt-1 text-slate-800 capitalize">
                    {venueTypes.find((t) => t.value === form.type)?.label ?? form.type}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</span>
                  <span className="block text-sm font-semibold mt-1 text-slate-800">
                    {form.capacity} guests
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pricing</span>
                  <span className="block text-sm font-semibold mt-1 text-slate-800">
                    {form.allowedModes === "HOURLY"
                      ? `₹${form.pricePerHour}/hr`
                      : form.allowedModes === "DAILY"
                      ? `₹${form.pricing}/day`
                      : `₹${form.pricing}/day • ₹${form.pricePerHour}/hr`}
                  </span>
                </div>
              </div>

              {form.amenities.length > 0 && (
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amenities Included</span>
                  <div className="flex flex-wrap gap-2">
                    {form.amenities.map((a) => (
                      <span key={a} className="text-xs font-semibold px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-600">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {form.description && (
                <div className="space-y-1.5 pt-2">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</span>
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                    {form.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation (Only visible for Step 1 onwards) */}
      {currentStep > 0 && (
        <footer className="bg-white border-t border-slate-100 sticky bottom-0 z-40">
          <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center w-full">
            <button
              onClick={back}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-4 py-2.5 rounded-xl border border-slate-100 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline-block">
                Step {currentStep} of {steps.length - 1}
              </span>
              {currentStep === steps.length - 1 ? (
                <Button
                  onClick={submit}
                  disabled={createVenue.isPending}
                  className="bg-[#0052ff] hover:bg-[#004ced] px-8 py-5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  {createVenue.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                      Publishing...
                    </span>
                  ) : (
                    <>
                      Publish Space <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={next}
                  className="bg-slate-900 hover:bg-slate-800 px-8 py-5 rounded-xl text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </footer>
      )}
      </div>
    </div>
  );
}
