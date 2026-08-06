# Xianova Robotics Website

Official site for **Xianova Robotics（夏仙创新）** — zero-shot generalization for robot manipulation.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- next-intl (`/zh`, `/en`)

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (redirects to `/zh`).

## Build

```bash
npm run build
npm start
```

## Structure

- `/[locale]` — home (hero + entry links)
- `/[locale]/technology` — ORGA technology
- `/[locale]/solutions` — products & solutions
- `/[locale]/about` — company & team
- `/[locale]/contact` — contact form

## Deploy

Vercel recommended. Point the project root at this repo and set the framework to Next.js.
