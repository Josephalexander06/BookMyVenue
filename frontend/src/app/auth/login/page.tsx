"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendOtp, useVerifyOtp } from "@/features/auth/hooks";
import { roleRoutes } from "@/lib/config";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const login = useAuthStore((state) => state.login);

  const onSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    await sendOtp.mutateAsync({ phone });
    setStep("otp");
  };

  const onVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await verifyOtp.mutateAsync({ phone, otp });
    login(response.access_token, response.user);

    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (redirect) {
      router.push(redirect);
      return;
    }

    router.push(roleRoutes[response.user.role as UserRole]);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === "phone" ? "Sign in" : "Enter code"}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5">
            {step === "phone"
              ? "Enter your phone number to continue"
              : `We sent a code to ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <form className="space-y-5" onSubmit={onSendOtp}>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="pl-10 h-12 rounded-xl border-slate-200 text-sm font-medium focus-visible:ring-slate-900 placeholder:text-slate-300"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={sendOtp.isPending}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            >
              {sendOtp.isPending ? "Sending..." : "Continue"}
            </Button>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={onVerifyOtp}>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-500">Verification code</label>
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  Change
                </button>
              </div>
              <Input
                required
                type="text"
                maxLength={6}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="000000"
                className="h-12 rounded-xl border-slate-200 text-center text-lg tracking-[0.3em] font-bold focus-visible:ring-slate-900 placeholder:text-slate-200 placeholder:tracking-[0.3em]"
              />
            </div>
            <Button
              type="submit"
              disabled={verifyOtp.isPending}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
            >
              {verifyOtp.isPending ? "Verifying..." : "Verify & continue"}
            </Button>
          </form>
        )}

        <p className="text-[11px] text-slate-300 text-center mt-6 leading-relaxed">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  );
}
