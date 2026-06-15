export const appConfig = {
  name: "BookMyVenue",
  description:
    "Community-driven marketplace for discovering and booking local venues.",
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
  razorpayKey:
    process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? "rzp_test_T1oDR115vwfmJo",
};

export const roleRoutes = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
} as const;
