# Zenith — Architecture

## Overview

Zenith is a mobile-first, dark-themed platform for astronomy enthusiasts to find stargazing locations, check light pollution, cloud cover, weather, view upcoming astronomical events, and organize meetups.

Tech stack (target): Next.js 15, TypeScript, Tailwind CSS, Prisma, PostgreSQL (+ PostGIS), Auth.js, Leaflet. Production-grade architecture assumes Redis for caching/queues, S3-compatible storage for media, and CDN for static assets.

## Non-functional requirements
- Performance: map tile + POI queries must be low-latency; geospatial indexes required.
- Scalability: read replicas for Postgres, Redis caching, background workers for heavy tasks.
- Reliability: background jobs for forecasts/ingestion, retries, observability.
- Security: Auth.js, role-based authorization, rate-limits, input validation, image scanning.

---

## 1. Folder structure (recommended)

zenith/
- app/                    # Next.js App Router pages + server components
  - api/                   # API route handlers (Next.js server functions)
  - layout.tsx
  - page.tsx
- components/             # Shared React components (Map, UI atoms)
  - map/
    - LeafletMap.tsx
    - Marker.tsx
  - ui/
    - Button.tsx
    - Modal.tsx
- modules/                # Feature modules (domain-driven grouping)
  - auth/
  - locations/
  - events/
  - meetups/
  - weather/
  - pollution/
  - media/
- lib/                    # Utilities, API clients, prisma client, geo helpers
- prisma/                 # Prisma schema + migrations
- scripts/                # Maintenance scripts (importers, cron jobs)
- worker/                 # Background worker code (queues, jobs)
- public/
- prisma/schema.prisma
- ARCHITECTURE.md

Notes: Keep `modules/*` domain-focused so frontend and backend code that belong together remain colocated.

---

## 2. Database schema (core models)

Assume Postgres with PostGIS. Prisma models below are conceptual (types approximate).

- users
  - id: UUID (PK)
  - email: text (unique)
  - name: text
  - role: enum (user, moderator, admin)
  - createdAt, updatedAt

- profiles
  - id: UUID (PK)
  - userId: FK -> users.id
  - avatarUrl: text
  - bio: text
  - location_preference: geometry(Point) or {lat,lng}

- locations (stargazing spots)
  - id: UUID (PK)
  - name: text
  - description: text
  - coordinates: geography(Point, 4326)  -- PostGIS
  - address: text
  - elevation_m: numeric
  - public: boolean
  - createdBy: FK -> users.id
  - createdAt, updatedAt
  - popularity_score: float (cached)
  - light_pollution_index: float (cached)

Indexes: GIST on `coordinates`, index on `popularity_score`, `light_pollution_index`.

- light_pollution_readings
  - id: UUID
  - locationId: FK -> locations.id (nullable if geo-tagged)
  - coordinates: geography(Point)
  - bortle_scale: int
  - measured_at: timestamp
  - source: enum (user, external)

- weather_snapshots
  - id: UUID
  - locationId: FK -> locations.id
  - cloud_cover_pct: smallint
  - visibility_km: numeric
  - temperature_c: numeric
  - fetchedAt: timestamp

- events (astronomical events)
  - id: UUID
  - title: text
  - description: text
  - startAt: timestamp
  - endAt: timestamp
  - eventType: enum (meteor_shower, eclipse, conjunction, etc.)
  - visibility_regions: GeoJSON / tags

- meetups
  - id: UUID
  - title, description
  - hostId: FK -> users.id
  - locationId: FK -> locations.id
  - scheduledAt: timestamp
  - capacity: int
  - status: enum (draft, published, cancelled)

- meetup_members
  - meetupId, userId, status (going, interested)

- photos
  - id: UUID
  - uploadedBy: FK -> users.id
  - locationId: FK -> locations.id (optional)
  - url: text
  - metadata: json (EXIF, exposure)
  - createdAt

- audit_logs, notifications, subscriptions, admin_notes

Notes: Use JSONB fields for metadata and third-party API responses. Use FK constraints and cascade rules where appropriate.

---

## 3. API routes (Next.js App Router style)

Auth: handled by Auth.js (sign-in, callback). Server endpoints below assume session middleware.

- POST /api/auth/signin (Auth.js)
- GET /api/auth/session (Auth.js)

- GET /api/locations
  - Query params: bbox, q, lat,lng, radius, sort (distance, popularity)
  - Public read; rate-limited; returns paginated results

- POST /api/locations
  - Auth required (user); body: name, coords, desc, visibility

- GET /api/locations/:id
  - Returns location details, aggregated scores, recent photos, next weather snapshot

- GET /api/locations/:id/light-pollution
  - Returns time-series / latest measurements

- GET /api/search
  - Unified search for locations, events, users

- GET /api/weather/forecast?lat=&lng=
  - Proxy to external weather provider; cached (Redis) for short TTL

- POST /api/events
  - Create astronomical events (admin-curated)
- GET /api/events
  - List events by time range / region

- POST /api/meetups
  - Create meetup (auth); background job to notify followers
- POST /api/meetups/:id/join
  - RSVP; validation (capacity)

- POST /api/uploads
  - Media upload (presigned S3 URL flow)

- GET /api/admin/flags
  - Admin only: moderation endpoints

- Webhooks
  - /api/webhooks/weather (ingest), /api/webhooks/payments

All write endpoints: CSRF protection (if applicable), input validation, role checks.

---

## 4. Component hierarchy (high-level)

Pages (Top-level):
- HomePage
- MapPage (explore)
- LocationPage
- EventsPage
- MeetupPage
- ProfilePage
- SignIn/SignUp
- Dashboard (user)
- AdminPanel

Shared components (reusable):
- Layout (global header/footer, theme provider)
- Navbar
- LeafletMap (server-side-friendly wrapper)
- MarkerCluster
- SearchBar
- FiltersPanel
- LocationCard
- EventCard
- MeetupCard
- PhotoGallery
- Modal, Drawer

Component composition examples:
- MapPage -> Layout -> LeafletMap -> MarkerCluster -> LocationCard (popup)
- LocationPage -> Layout -> LocationHeader + PhotoGallery + RecentMeasurements + UpcomingEvents + MeetupList

Styling: Tailwind + design tokens in `styles/` + dark theme toggle service.

---

## 5. Feature modules (responsibilities & interactions)

- Auth
  - Responsibilities: sign-in, sessions, roles, account linking.
  - Integrations: Auth.js, OAuth providers, email service for invites.

- Locations (Geo)
  - Responsibilities: CRUD for spots, geospatial search, popularity scoring.
  - Tech: PostGIS, Prisma geospatial helpers, server-side ranking.

- Light Pollution
  - Responsibilities: ingest measurements, compute Bortle or normalized index, time-series storage.
  - Integrations: external datasets, user-submitted readings.

- Weather & Forecasts
  - Responsibilities: fetch cloud cover and weather forecasts per point; cache results; surface short-term alerts.
  - Integrations: Weather APIs (e.g., OpenWeatherMap, Meteomatics), background cron jobs.

- Events (astronomical events)
  - Responsibilities: curated astronomical events, visibility mapping, reminders.

- Meetups
  - Responsibilities: meetup lifecycle, RSVPs, capacity checks, host management, activity feed.

- Media
  - Responsibilities: upload flow, presigned URLs, image optimization, EXIF extraction.

- Notifications
  - Responsibilities: email/push/web notifications for meetups, events, mentions.

- Admin & Moderation
  - Responsibilities: content moderation, flag review, user bans, analytics.

- Background Worker (worker/)
  - Jobs: ingest external datasets, scheduled forecast fetches, notification dispatch, compute aggregates.
  - Tech: BullMQ or Bee-Queue with Redis; run as separate process / container.

- Integrations & External
  - Map tiles: use a tile provider or self-hosted tiles; Leaflet for rendering.
  - Payment provider (optional) for donations/subscriptions.

---

## 6. Operational considerations
- Caching: Redis for weather results, search caches, rate-limiting counters.
- Background processing: worker cluster, job retries, dead-letter queues.
- Observability: structured logs, Sentry for errors, metrics (Prometheus + Grafana) for key SLAs.
- Deployment: containerized (Docker) with orchestrator (Kubernetes or managed service). Use CI to run lint/tests and deploy canary releases.

## 7. Next steps
- Convert models to a Prisma schema in `prisma/schema.prisma`.
- Implement API route contracts (OpenAPI spec or TypeScript types) and add integration tests.
- Scaffold frontend pages/components per `modules/` layout.

---

If you want, I can now: (1) generate the Prisma schema, (2) scaffold the folder structure and empty files, or (3) produce OpenAPI-style route specs. Tell me which next step to take.
