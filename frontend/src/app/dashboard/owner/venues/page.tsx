"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  useCreateVenue,
  useDeleteVenue,
  useUpdateVenue,
  useVenues,
} from "@/features/venues/hooks";
import { CreateVenuePayload, Venue } from "@/types/venue";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MapPin, Plus, Trash2, Users, Pencil, IndianRupee, ImagePlus, X } from "lucide-react";
import MapPicker from "@/components/ui/map-picker";

const links = [
  { href: "/dashboard/owner", label: "Overview" },
  { href: "/dashboard/owner/venues", label: "Venues" },
  { href: "/dashboard/owner/bookings", label: "Bookings" },
];

const emptyForm: CreateVenuePayload = {
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
};

const venueTypeLabels: Record<string, string> = {
  meeting_room: "Meeting Room",
  studio: "Studio",
  auditorium: "Auditorium",
  community_center: "Community Center",
  event_venue: "Event Venue",
  cafe: "Café",
  convention_hall: "Convention Hall",
  outdoor: "Outdoor",
};

export default function OwnerVenuesPage() {
  const router = useRouter();
  const { data, isLoading } = useVenues({ ownerOnly: true });
  const createVenue = useCreateVenue();
  const updateVenue = useUpdateVenue();
  const deleteVenue = useDeleteVenue();

  const [form, setForm] = useState<CreateVenuePayload>(emptyForm);
  const [editing, setEditing] = useState<Venue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    if (editing) {
      await updateVenue.mutateAsync({ id: editing.id, payload: form });
      setEditing(null);
    } else {
      await createVenue.mutateAsync({ ...form, imageFiles: selectedFiles });
    }
    setForm(emptyForm);
    setSelectedFiles([]);
    setDialogOpen(false);
  };

  const openEdit = (venue: Venue) => {
    setEditing(venue);
    setForm({
      name: venue.name,
      description: venue.description,
      capacity: venue.capacity,
      location: venue.location,
      latitude: venue.latitude,
      longitude: venue.longitude,
      type: venue.type,
      amenities: venue.amenities,
      pricing: venue.pricing,
      pricePerHour: venue.pricePerHour ?? Math.round(venue.pricing / 8),
      allowedModes: venue.allowedModes ?? "BOTH",
      imageUrl: venue.imageUrl,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSelectedFiles([]);
    setDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
        <DashboardSidebar links={links} />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-40 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-4 w-16 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const venues = data?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Venues
          </h1>

          <Button
            onClick={openCreate}
            className="gap-2 rounded-xl shadow-soft transition-all hover:shadow-hover"
          >
            <Plus className="h-4 w-4" />
            Add venue
          </Button>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            if (!open) {
              setEditing(null);
              setDialogOpen(false);
            }
          }}>

            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {editing ? "Edit venue" : "New venue"}
                  </DialogTitle>
                  <DialogDescription className="mt-1 text-sm text-slate-500">
                    {editing
                      ? "Update the details below"
                      : "Fill in the details to list your space"}
                  </DialogDescription>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Name</label>
                    <Input
                      placeholder="e.g. The Grand Hall"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <Textarea
                      placeholder="Describe the venue, ambiance, highlights…"
                      value={form.description}
                      onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                      rows={3}
                      className="rounded-xl border-slate-200"
                    />
                  </div>

                  {/* Booking Allowed Modes */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Allowed Booking Mode</label>
                    <Select
                      value={form.allowedModes ?? "BOTH"}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          allowedModes: e.target.value as CreateVenuePayload["allowedModes"],
                        }))
                      }
                      className="h-11 rounded-xl border-slate-200"
                    >
                      <option value="BOTH">Both Daily & Hourly</option>
                      <option value="DAILY">Daily Booking Only (Airbnb style)</option>
                      <option value="HOURLY">Hourly Slots Only (BookMyShow style)</option>
                    </Select>
                  </div>

                  {/* Price per Day & Hour Fields */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 col-span-1">
                      <label className="text-sm font-medium text-slate-700">Capacity</label>
                      <Input
                        type="number"
                        value={form.capacity}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, capacity: Number(e.target.value) }))
                        }
                        className="h-11 rounded-xl border-slate-200"
                      />
                    </div>
                    {(form.allowedModes === "DAILY" || form.allowedModes === "BOTH" || !form.allowedModes) && (
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-sm font-medium text-slate-700">Price / day</label>
                        <Input
                          type="number"
                          value={form.pricing}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, pricing: Number(e.target.value) }))
                          }
                          className="h-11 rounded-xl border-slate-200"
                        />
                      </div>
                    )}
                    {(form.allowedModes === "HOURLY" || form.allowedModes === "BOTH") && (
                      <div className="space-y-1.5 col-span-1">
                        <label className="text-sm font-medium text-slate-700">Price / hour</label>
                        <Input
                          type="number"
                          value={form.pricePerHour ?? Math.round(form.pricing / 8)}
                          onChange={(e) =>
                            setForm((p) => ({ ...p, pricePerHour: Number(e.target.value) }))
                          }
                          className="h-11 rounded-xl border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Address</label>
                    <Input
                      placeholder="Full address (or click map below to auto-fill)"
                      value={form.location}
                      onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                      className="h-11 rounded-xl border-slate-200"
                    />
                  </div>

                  {/* Map Pin Selector */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Map Pin Location</label>
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

                  {/* Type */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Type</label>
                    <Select
                      value={form.type}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          type: e.target.value as CreateVenuePayload["type"],
                        }))
                      }
                      className="h-11 rounded-xl border-slate-200"
                    >
                      <option value="meeting_room">Meeting Room</option>
                      <option value="studio">Studio</option>
                      <option value="auditorium">Auditorium</option>
                      <option value="community_center">Community Center</option>
                      <option value="event_venue">Event Venue</option>
                    </Select>
                  </div>

                  {/* Image Upload (only for create, not edit) */}
                  {!editing && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700">Venue Images</label>
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
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-[#F84464]/40 hover:text-[#F84464] transition-colors bg-slate-50/50"
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs font-semibold">Click to upload images</span>
                      </button>
                      {selectedFiles.length > 0 && (
                        <div className="flex gap-2 flex-wrap pt-1">
                          {selectedFiles.map((file, idx) => (
                            <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-slate-200 group">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))}
                                className="absolute top-0.5 right-0.5 h-5 w-5 rounded-full bg-slate-900/60 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  className="h-11 w-full rounded-xl text-sm font-semibold shadow-soft transition-all hover:shadow-hover"
                  onClick={submit}
                  disabled={createVenue.isPending || updateVenue.isPending}
                >
                  {createVenue.isPending || updateVenue.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving…
                    </span>
                  ) : editing ? (
                    "Update venue"
                  ) : (
                    "Create venue"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Venue grid */}
        {venues.length === 0 ? (
          <EmptyState
            title="No venues yet"
            description="Add your first venue to start receiving bookings."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => (
              <Card
                key={venue.id}
                className="group relative overflow-hidden rounded-2xl border-slate-100 bg-white shadow-soft transition-all duration-200 hover:shadow-hover"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-slate-900 leading-snug">
                      {venue.name}
                    </CardTitle>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                      {venueTypeLabels[venue.type] ?? venue.type}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {venue.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {venue.capacity}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {venue.pricing}/day
                    </span>
                    {venue.pricePerHour && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        {venue.pricePerHour}/hr
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => openEdit(venue)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteVenue.mutate(venue.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
