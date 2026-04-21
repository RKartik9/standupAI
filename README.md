# StandupAI

Async standup platform with AI-powered insights.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: ShadCN components
- **Fonts**: Anton (display) + Inter (body)
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: Clerk
- **Real-time**: Pusher
- **AI**: OpenAI API
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Animation**: Framer Motion

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```env
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Real-time
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=

# AI
OPENAI_API_KEY=
```

## Database

```bash
npm run db:generate  # Generate migration
npm run db:migrate   # Run migration
npm run db:studio    # Open Drizzle Studio
```

## Project Structure

```
/app                  # Next.js routes
/components
  /ui                 # ShadCN primitives
  /dashboard          # Dashboard UI
  /marketing          # Landing page
  /forms              # Form components
/lib
  /db                 # Database schema
  /ai                 # OpenAI integration
  /pusher             # Real-time
  /validations        # Zod schemas
/hooks                # Custom hooks
/store                # Zustand stores
```

## Design System

- **Colors**: Warm neutrals (#FAFAF8 bg)
- **Typography**: Anton (headings) + Inter (body)
- **Spacing**: 4px base scale
- **Radius**: 8px default

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
```
