"use client";

import { useState, useEffect } from "react";
import { Building2, Phone, X, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSendOtp, useVerifyOtp } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/auth-store";

export function LoginModal() {
  const { isLoginOpen, closeLogin, login, onLoginSuccess } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isLoginOpen) {
      setPhone("");
      setOtp("");
      setStep("phone");
    }
  }, [isLoginOpen]);

  const onSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await sendOtp.mutateAsync({ phone });
      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
    }
  };

  const onVerifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await verifyOtp.mutateAsync({ phone, otp });
      login(response.access_token, response.user);
      
      // Close modal first
      closeLogin();
      
      // Trigger callback if registered
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error) {
      console.error("Failed to verify OTP:", error);
    }
  };

  return (
    <Dialog open={isLoginOpen} onOpenChange={(open) => !open && closeLogin()}>
      <DialogContent className="sm:max-w-md border-none p-0 overflow-hidden bg-white shadow-hover rounded-2xl">
        <DialogTitle className="sr-only">Sign In to BookMyVenue</DialogTitle>
        <DialogDescription className="sr-only">
          Sign in with your phone number and get an OTP to access your bookings and list venues.
        </DialogDescription>
        
        <div className="relative p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-6 w-6 text-accent" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Book<span className="text-accent">My</span>Venue
            </span>
          </div>

          {/* Step Back (only when typing OTP) */}
          {step === "otp" && (
            <button
              onClick={() => setStep("phone")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-6"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {step === "phone" ? "Sign in" : "Enter code"}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {step === "phone"
                ? "Enter your phone number to continue to booking and hosting options."
                : `We sent a code to your phone number ${phone}`}
            </p>
          </div>

          {step === "phone" ? (
            <form className="space-y-4" onSubmit={onSendOtp}>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">
                  Phone number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    required
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 98765 43210"
                    className="pl-10 h-11 rounded-xl border-slate-200 text-sm font-medium focus-visible:ring-accent placeholder:text-slate-300 bg-slate-50/50"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={sendOtp.isPending}
                className="w-full h-11 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98] mt-2 shadow-soft"
              >
                {sendOtp.isPending ? "Sending code..." : "Continue"}
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onVerifyOtp}>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Verification code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    className="text-xs font-semibold text-accent hover:underline"
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
                  className="h-11 rounded-xl border-slate-200 text-center text-base tracking-[0.2em] font-bold focus-visible:ring-accent placeholder:text-slate-200 placeholder:tracking-[0.2em] bg-slate-50/50"
                />
              </div>
              <Button
                type="submit"
                disabled={verifyOtp.isPending}
                className="w-full h-11 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98] mt-2 shadow-soft"
              >
                {verifyOtp.isPending ? "Verifying..." : "Verify & continue"}
              </Button>
            </form>
          )}

          <p className="text-[10px] text-slate-400 text-center mt-6 leading-relaxed">
            By continuing, you agree to our terms and privacy policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
