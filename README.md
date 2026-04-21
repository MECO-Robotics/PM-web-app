# MECO Web

React/Vite browser frontend for the MECO Robotics project-management platform.

## Why this repo exists

The requirements doc strongly supports both mobile-friendly use and broader browser-based access. This repo is the desktop/web surface for:

- mentor and admin dashboards
- subsystem health review
- QA and escalation queues
- purchasing and fabrication oversight
- planning and reporting views

The mobile app remains optimized for in-shop updates, sign-ins, and quick workflow actions.

## Stack split

- `meco-mobile`: Expo/React Native for mobile-first workflow access
- `meco-web`: React/Vite for browser dashboards and admin access
- `meco-platform`: Fastify + Prisma API hosted on DigitalOcean

## Local commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Deployment

This repo is set up to be a good fit for a DigitalOcean App Platform static site. Point `VITE_API_BASE_URL` at the deployed `meco-platform` API.
