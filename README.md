# JobTrack

A job-application tracker built as a status board (Applied → Assessment → Interview → Offer / Rejected), so you can see every application, HR contact, and upcoming deadline at a glance.

## Problem

Job seekers applying to 20–50 companies lose track of:
- which companies they've applied to
- current application status
- assessment / interview dates
- HR contact details
- when to follow up

## Tech stack

- **React 18** (functional components + hooks)
- **Vite** for dev server and build
- **Plain CSS** (CSS variables for theming, no framework)
- **localStorage** for persistence — no backend required

## Project structure

```
src/
  App.jsx                  — top-level state (drawer, search, toast, confetti)
  main.jsx                 — React entry point
  styles.css                — all styling
  hooks/
    useApplications.js      — CRUD + localStorage persistence, as a custom hook
  utils/
    statusMeta.js            — status labels/colors, column order
    dateHelpers.js            — pure date utility functions
  components/
    TopBar.jsx                — brand, search, "add" button
    StatsBar.jsx                — derived stats (useMemo)
    Board.jsx                    — column layout + empty state
    Column.jsx                    — one status lane, sorted by nearest date
    Card.jsx                       — single application card
    Drawer.jsx                      — controlled add/edit form
    Confetti.jsx                     — small celebration on "Offer"
    Toast.jsx                         — save/delete confirmations
```

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

The `dist/` folder can be deployed to Netlify, Vercel, or GitHub Pages as a static site.

## Notes

- Data is stored in the browser's `localStorage`, scoped to whichever browser/device you use it on. There's no account system or sync across devices.
- No external UI libraries — every component and animation is custom, to keep the bundle small and the code easy to read end to end.
