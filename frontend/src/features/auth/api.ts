import { apiClient } from "@/lib/api/client";
import type {
  SendOtpPayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "@/types/auth";

export async function sendOtp(payload: SendOtpPayload) {
  const { data } = await apiClient.post("/user/auth/send-otp", {
    phone_no: payload.phone,
  });
  return data;
}

export async function verifyOtp(payload: VerifyOtpPayload) {
  const { data } = await apiClient.post<{ access_token: string; token_type: string }>(
    "/user/auth/verify-otp",
    {
      phone_no: payload.phone,
      otp: payload.otp,
    },
  );

  const token = data.access_token;
  let role = "customer";
  let sub = "";

  try {
    if (typeof window !== "undefined") {
      const payloadPart = token.split(".")[1];
      const decoded = JSON.parse(window.atob(payloadPart));
      role = decoded.role ?? "customer";
      sub = decoded.sub ?? "";
    }
  } catch (e) {
    console.error("Failed to decode JWT token:", e);
  }

  return {
    access_token: token,
    user: {
      id: sub,
      name: `User ${sub}`,
      phone: payload.phone,
      role: role as any,
    },
  };
}

export async function becomeOwner() {
  const { data } = await apiClient.post<any>("/user/owner");
  return data;
}

export async function getUsers() {
  const { data } = await apiClient.get<any[]>("/user/getuser");
  return data.map((u: any) => ({
    id: String(u.id),
    phone: u.phone_number,
    role: u.role,
    status: u.is_verified ? "Active" : "Inactive",
  }));
}
