"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useUserProfile, useUpdateUserProfile, useBecomeOwner } from "@/features/auth/hooks";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, User, Calendar, Loader2, ShieldCheck } from "lucide-react";

const links = [
  { href: "/dashboard/customer", label: "Overview" },
  { href: "/dashboard/customer/profile", label: "Profile" },
];

function CustomerProfileInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isUpgrade = searchParams.get("upgrade") === "true";
  
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();
  const becomeOwner = useBecomeOwner();
  const { login } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isUpgradingState, setIsUpgradingState] = useState(false);

  // Auto-upgrade if profile is already complete and upgrade flag is set
  useEffect(() => {
    if (profile && isUpgrade) {
      if (profile.firstName && profile.lastName && profile.dob) {
        // Profile is complete! Trigger the upgrade automatically
        handleUpgrade();
      }
    }
  }, [profile, isUpgrade]);

  // Sync state when profile is loaded
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      if (profile.dob) {
        setDob(profile.dob.split("T")[0]);
      }
    }
  }, [profile]);

  const handleUpgrade = async () => {
    setIsUpgradingState(true);
    setSuccessMsg("Upgrading your account to Host...");
    try {
      const res = await becomeOwner.mutateAsync();
      if (res?.access_token && res?.user) {
        login(res.access_token, {
          id: String(res.user.id),
          name: `User ${res.user.id}`,
          phone: res.user.phone_number,
          role: res.user.role,
        });
      }
      setSuccessMsg("Account upgraded successfully! Redirecting to Owner Dashboard...");
      setTimeout(() => {
        router.push("/dashboard/owner");
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to upgrade to host. Please try again.");
      setIsUpgradingState(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim() || !dob) {
      setErrorMsg("All fields are required.");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        firstName,
        lastName,
        dob,
      });
      
      if (isUpgrade) {
        // If they want to upgrade, trigger it immediately after updating profile
        await handleUpgrade();
      } else {
        setSuccessMsg("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.response?.data?.detail ?? "Failed to update profile.");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 font-sans">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            View and update your personal profile details.
          </p>
        </div>

        {/* Upgrade Banner */}
        {isUpgrade && !isUpgradingState && (
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-xs font-bold text-amber-700 flex items-center gap-2.5 max-w-2xl">
            <ShieldCheck className="h-5 w-5 text-[#F84464] shrink-0" />
            <span>You need to fill out your profile details before upgrading to a Host account.</span>
          </div>
        )}

        {/* Profile Card Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-soft max-w-2xl">
          {isLoading || isUpgradingState ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#F84464] mb-3" />
              <p className="text-xs font-semibold font-sans">
                {isUpgradingState ? "Upgrading your account..." : "Loading profile details..."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid gap-4 sm:grid-cols-2">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    First Name
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm hover:border-[#F84464]/40 transition-colors focus-within:ring-2 focus-within:ring-[#F84464]/20 focus-within:border-[#F84464] flex items-center">
                    <User className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                    <Input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="w-full bg-transparent p-0 border-0 outline-none text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Last Name
                  </label>
                  <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm hover:border-[#F84464]/40 transition-colors focus-within:ring-2 focus-within:ring-[#F84464]/20 focus-within:border-[#F84464] flex items-center">
                    <User className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                    <Input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="w-full bg-transparent p-0 border-0 outline-none text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Date of Birth
                </label>
                <div className="relative rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm hover:border-[#F84464]/40 transition-colors focus-within:ring-2 focus-within:ring-[#F84464]/20 focus-within:border-[#F84464] flex items-center">
                  <Calendar className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-transparent p-0 border-0 outline-none text-sm font-semibold focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-slate-800"
                  />
                </div>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 text-xs font-semibold text-rose-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={updateProfile.isPending || becomeOwner.isPending}
                className="w-full h-12 rounded-2xl bg-[#F84464] hover:bg-[#e03d5a] text-white text-sm font-bold shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateProfile.isPending || becomeOwner.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  isUpgrade ? "Save & Become a Host" : "Save Profile Details"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#F84464] mb-3" />
        <p className="text-xs font-semibold">Loading Page...</p>
      </div>
    }>
      <CustomerProfileInner />
    </Suspense>
  );
}
