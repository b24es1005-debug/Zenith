# Deployment Guide

## Prerequisites

- Node.js 20 or newer.
- A PostgreSQL database.
- Google OAuth credentials for Auth.js.
- Optional GitHub OAuth credentials.
- OpenWeather API key.

## Required environment variables

- `DATABASE_URL`
- `OPENWEATHER_API_KEY`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- Optional: `AUTH_GITHUB_ID`
- Optional: `AUTH_GITHUB_SECRET`

## Local setup

1. Install dependencies with `npm install`.
2. Generate the Prisma client with `npx prisma generate`.
3. Apply migrations with `npx prisma migrate deploy`.
4. Start the app with `npm run dev`.

## Production build

1. Verify the app builds with `npm run build`.
2. Verify linting with `npm run lint`.
3. Confirm Auth.js callback URLs point to the deployed domain and to `http://localhost:3000/api/auth/callback/google` for local development.

## OAuth verification checklist

- Google sign-in reaches the Google account chooser.
- The callback returns to `/dashboard` after login.
- A Prisma `Account` row is created.
- A Prisma `Session` row is created.
- Dashboard access works after sign-in.
- Logout clears the session and redirects to the public home page.

## Common warnings

- Next.js 16 warns that `middleware.ts` is deprecated in favor of `proxy.ts`.
- PostgreSQL drivers may warn about `sslmode=require` semantics.

## Recommended deployment order

1. Push code.
2. Apply database migrations.
3. Set production environment variables.
4. Deploy.
5. Validate Google OAuth login, dashboard access, and logout.