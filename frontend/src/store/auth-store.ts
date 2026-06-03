"use client";

import { create } from "zustand";
import type { AuthState, AuthUser } from "@/types/auth";
import {
  clearToken,
  getSerializedUser,
  getToken,
  setSerializedUser,
  setToken,
} from "@/lib/auth/token-storage";

interface AuthStore extends AuthState {
  hydrate: () => void;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  hydrate: () => {
    const token = getToken();
    const serializedUser = getSerializedUser();
    const user = serializedUser ? (JSON.parse(serializedUser) as AuthUser) : null;

    set({
      token,
      user,
      isAuthenticated: Boolean(token && user),
    });
  },
  login: (token, user) => {
    setToken(token);
    setSerializedUser(JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    clearToken();
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
