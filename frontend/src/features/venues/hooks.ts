"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVenue,
  deleteVenue,
  getVenueById,
  getVenues,
  updateVenue,
  getBookedDates,
} from "@/features/venues/api";
import type { CreateVenuePayload, VenueFilters } from "@/types/venue";

export function useVenues(filters?: VenueFilters & { ownerOnly?: boolean }) {
  return useQuery({
    queryKey: ["venues", filters],
    queryFn: () => getVenues(filters),
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
  return useQuery({
    queryKey: ["booked-dates", id],
    queryFn: () => getBookedDates(id),
    enabled: Boolean(id),
  });
}
