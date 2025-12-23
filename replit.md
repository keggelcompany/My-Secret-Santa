# My Secret Santa

## Overview

My Secret Santa is a web application for organizing Secret Santa gift exchanges for companies, friends, or family groups. The platform allows hosts to create events, invite participants via email with magic links, automatically match participants for gift-giving, manage wishlists, and generate personalized event wrap-up cards.

The application features an elegant, holiday-themed design with Christmas elements, using primary colors of accent red (#D83F31) and secondary green (#1F4C34), along with gold (#D3AF64) accents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state management
- **Styling**: Tailwind CSS with CSS variables for theming
- **UI Components**: shadcn/ui component library (Radix UI primitives with custom styling)
- **Animations**: Framer Motion for smooth UI transitions
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Development Server**: Vite middleware integration for HMR during development
- **Production Build**: esbuild for server bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (via Neon serverless)
- **Schema Validation**: Zod with drizzle-zod integration
- **Schema Location**: Shared between client and server in `shared/schema.ts`

### Key Data Models
- **Events**: Stores Secret Santa exchanges with host information and status
- **Participants**: Users in an event, with magic tokens for passwordless auth and assignment tracking
- **Wishlist Items**: Gift ideas linked to participants

### Authentication Pattern
- Magic link authentication via unique tokens per participant
- No password storage - tokens sent via email (currently simulated via console logging)
- Participants access dashboards via `/join/:token` routes

### Project Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/ui/  # shadcn/ui components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client/server
│   └── schema.ts     # Drizzle schema and Zod validators
└── migrations/       # Database migrations (Drizzle Kit)
```

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database via `@neondatabase/serverless`
- **Connection**: Requires `DATABASE_URL` environment variable

### Key Frontend Libraries
- `@tanstack/react-query`: Async state management
- `framer-motion`: Animation library
- `wouter`: Client-side routing
- `react-day-picker`: Calendar/date picker
- `embla-carousel-react`: Carousel component
- `recharts`: Charts and data visualization
- `vaul`: Drawer component

### Key Backend Libraries
- `express`: HTTP server framework
- `drizzle-orm`: Database ORM
- `drizzle-kit`: Database migrations and schema management
- `zod`: Runtime type validation

### Development Tools
- `vite`: Frontend build tool with HMR
- `esbuild`: Server bundling for production
- `tsx`: TypeScript execution for development
- Replit-specific plugins for development experience