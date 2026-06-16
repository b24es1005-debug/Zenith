# Project Summary

Zenith is a production-style astronomy planning app that blends map exploration, sky-condition intelligence, meetup coordination, and authenticated dashboards.

## What it does

- Helps users discover dark-sky locations.
- Surfaces weather, light pollution, astronomy, and Zenith Score data.
- Supports community meetup creation and browsing.
- Stores sessions and user data with Auth.js and Prisma.

## Why it stands out

- Strong full-stack separation between server components, route handlers, and client interactions.
- Real external integrations with OpenWeather, Nominatim, and astronomy calculations.
- Production-oriented attention to loading states, error handling, SEO, and accessibility.
- Mobile-first dark UI with polished visual language.

## Architecture highlights

- Next.js App Router for page rendering and metadata.
- Prisma ORM with PostgreSQL for persistence.
- Auth.js for OAuth and database sessions.
- Leaflet for interactive map experiences.
- Caching and validation around external APIs.

## Complexity score

- 9/10

## Resume-ready value

- Demonstrates real auth/session handling.
- Demonstrates database design and migration work.
- Demonstrates API integration and caching.
- Demonstrates production polish across SEO, accessibility, and mobile responsiveness.