This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Fire Hazard API

The map currently uses NASA's EONET wildfire feed as the default source for fire hazard data. The API route lives in `app/api/fire-hazards/route.js`.

### Where the app calls the API

The client-side app makes requests to the same internal route from two pages:

- `/map` renders the interactive map through `components/MapView.js`, which calls `fetch("/api/fire-hazards")` on mount.
- `/hazards` renders a hazard list through `app/hazards/page.js`, which also calls `fetch("/api/fire-hazards")` on mount.

### How the map is rendered

1. `app/map/page.js` loads `components/MapView.js` dynamically with server-side rendering disabled so the map runs client-side.
2. `MapView` requests the browser location when available and uses it to center the map; otherwise it falls back to Anaheim, California.
3. It fetches hazard data from `/api/fire-hazards`, stores it in React state, and uses Leaflet to draw a marker for each hazard.
4. Each marker is colored by severity and opens a popup when clicked, showing the hazard title, type, level, timestamp, and a fallback image.
5. If the live feed fails or returns no data, the app falls back to sample hazards from `data/hazards.js`.

### What the API route does

The server handler in `app/api/fire-hazards/route.js`:

- tries `FIRE_HAZARDS_API_URL` first when configured,
- then calls NASA EONET at `https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires&limit=50`,
- and optionally calls the NASA FIRMS CSV endpoint when `FIRMS_API_KEY` is present.

If you want to use a different provider later, set an environment variable before starting the app:

```bash
FIRE_HAZARDS_API_URL=https://your-api.example.com/fire-hazards
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
