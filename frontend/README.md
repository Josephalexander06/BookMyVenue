# BookMyVenue Frontend

Modern, production-ready frontend for BookMyVenue built with Next.js 15, TypeScript, Tailwind CSS, React Query, Axios, and Zustand.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Radix primitives with shadcn-style UI components
- React Query for server state
- Axios API layer
- Zustand auth store

## Setup

1. Install dependencies

npm install

2. Configure environment

Copy .env.example to .env.local and set your backend URL.

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

3. Run development server

npm run dev

4. Build for production

npm run build

## Implemented Pages

- /
- /venues
- /venues/[id]
- /venues/[id]/book
- /auth/login
- /dashboard/customer
- /dashboard/owner
- /dashboard/owner/venues
- /dashboard/owner/bookings
- /dashboard/admin
- /dashboard/admin/users
- /dashboard/admin/venues
- /dashboard/admin/reports

## API Integration

Connected endpoints:

- GET /venues
- GET /venues/{id}
- POST /venues
- PUT /venues/{id}
- DELETE /venues/{id}
- POST /auth/send-otp
- POST /auth/verify-otp
- POST /bookings
- GET /bookings
- PATCH /bookings/{id}/approve
- PATCH /bookings/{id}/reject

## Notes

- Middleware protects /dashboard routes using JWT cookie presence.
- Auth token is persisted in localStorage and mirrored to cookie for route checks.
- Fallback mock data is shown when APIs are unavailable, so UI remains usable for demos.
