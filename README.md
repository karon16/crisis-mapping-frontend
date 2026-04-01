# Crisis Map Frontend

This is a frontend application for a crisis mapping platform built with [Next.js](https://nextjs.org), [React](https://react.dev/), and [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/).

## Technologies Used

- **Framework**: Next.js (App Router)
- **UI & Styling**: React, Tailwind CSS
- **Maps**: Mapbox GL JS, `react-map-gl`, `@mapbox/mapbox-gl-geocoder`
- **Icons**: Heroicons, Lucide React
- **Tooling**: TypeScript, ESLint, Prettier

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

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

## Environment Variables

You will need a Mapbox access token to load the map layers and use the geocoder functionality. Create a `.env.local` file in the root directory and add the required mapbox token.

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```
