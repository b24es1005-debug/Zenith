# Zenith Project Context

Have you ever experienced the feeling while stargazing, you would be amazed and you always wanted your friends and family to experience it at least once. You crave to know about or organize the community stargazing meetups but ended up finding no tools which does all of them. That is the reason why I built Zenith-astronomy intelligence community platform.
Zenith is a production-oriented astronomy planning platform built for people who want to find dark-sky locations, compare sky conditions, and organize meetups under a mobile-first, dark-themed interface.

## Core goals

- Find and save stargazing locations.
- Evaluate weather, cloud cover, light pollution, and Zenith Score.
- View upcoming astronomical events and moon/sun timing.
- Organize and join community astronomy meetups.
- Provide a polished, portfolio-ready product experience with strong SEO, accessibility, and mobile behavior.

## Primary users

- Amateur astronomers.
- Astrophotographers.
- Telescope owners.
- Students interested in astronomy.

## Current stack

- Next.js App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Prisma ORM.
- PostgreSQL.
- Auth.js with Google OAuth and optional GitHub OAuth.
- Leaflet for the map experience.

## Product qualities emphasized

- Dark astronomy visual language.
- Responsive layouts that work on mobile and desktop.
- SEO metadata for major routes.
- Accessible navigation, buttons, menus, and status messages.
- Graceful loading, empty, and error states.

## Operational notes

- Auth uses Prisma-backed sessions.
- Weather, astronomy, and map intelligence use external APIs with server-side validation and caching.
- Meetup listing uses page-based pagination with Prisma skip/take.
- Database schema includes Auth.js account/session tables and astronomy-specific domain models.
