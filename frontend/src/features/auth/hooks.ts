"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { sendOtp, verifyOtp, becomeOwner, getUsers } from "@/features/auth/api";

export function useSendOtp() {
  return useMutation({ mutationFn: sendOtp });
}

export function useVerifyOtp() {
  return useMutation({ mutationFn: verifyOtp });
}

export function useBecomeOwner() {
  return useMutation({ mutationFn: becomeOwner });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
}
