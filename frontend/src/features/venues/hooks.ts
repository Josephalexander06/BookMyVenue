"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVenue,
  deleteVenue,
  getVenueById,
  getVenues,
  updateVenue,
  getBookedDates,
  getAdminVenues,
  approveVenue,
  rejectVenue,
  blockVenue,
  getVenueTimeslots,
  updateVenueTimeslots,
  type BusinessHoursPayload,
} from "@/features/venues/api";
import type { CreateVenuePayload, VenueFilters } from "@/types/venue";

/**
 * Debounces only the search term so that the API request only fires
 * after the user stops typing for `delay` ms.
 * Other filter changes (type, page) take effect immediately.
 */
export function useVenues(filters?: VenueFilters & { ownerOnly?: boolean }) {
  const rawSearch = filters?.search ?? "";
  const [debouncedSearch, setDebouncedSearch] = useState(rawSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // If clearing the search box, update immediately (no delay)
    if (!rawSearch.trim()) {
      setDebouncedSearch("");
      return;
    }

    // Otherwise debounce
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(rawSearch);
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [rawSearch]);

  // Build a stable query key that only uses the debounced search
  const page = filters?.page ?? 1;
  const pageSize = filters?.pageSize ?? 16;
  const type = filters?.type ?? "all";
  const ownerOnly = filters?.ownerOnly ?? false;

  return useQuery({
    queryKey: ["venues", { search: debouncedSearch, type, page, pageSize, ownerOnly }],
    queryFn: () =>
      getVenues({
        ...filters,
        search: debouncedSearch,
      }),
  });
}

export function useVenue(id: string) {
  return useQuery({
    queryKey: ["venue", id],
    queryFn: () => getVenueById(id),
    enabled: Boolean(id),
  });
}

export function useCreateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVenuePayload) => createVenue(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["venues"] }),
  });
}

export function useUpdateVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateVenuePayload> }) =>
      updateVenue(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", variables.id] });
    },
  });
}

export function useDeleteVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVenue,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["venues"] }),
  });
}

export function useBookedDates(id: string) {
  const isNumeric = id ? /^\d+$/.test(id) : false;
  return useQuery({
    queryKey: ["booked-dates", id],
    queryFn: () => getBookedDates(id),
    enabled: Boolean(id) && isNumeric,
  });
}

export function useAdminVenues() {
  return useQuery({
    queryKey: ["admin-venues"],
    queryFn: () => getAdminVenues(),
  });
}

export function useApproveVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
}

export function useRejectVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
}

export function useBlockVenue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => blockVenue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-venues"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
}

export function useVenueTimeslots(id: string) {
  return useQuery({
    queryKey: ["venue-timeslots", id],
    queryFn: () => getVenueTimeslots(id),
    enabled: Boolean(id),
  });
}

export function useUpdateVenueTimeslots() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, timeslots }: { id: string; timeslots: BusinessHoursPayload[] }) =>
      updateVenueTimeslots(id, timeslots),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["venue-timeslots", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", variables.id] });
    },
  });
}
