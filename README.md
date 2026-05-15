# Zyappy Frontend

Production-grade POS & Admin system built with React, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety (strict mode)
- **Tailwind CSS** - Utility-first styling
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

## Project Structure

```
src/
├── app/                 # Application core
│   ├── layout/         # Layout components
│   ├── router/         # Routing configuration
│   └── providers/      # Context providers
│
├── modules/            # Feature modules
│   ├── m0/            # Platform foundation
│   ├── m9/            # Admin dashboard
│   └── shared/        # Shared module code
│
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── layout/        # Layout components
│   └── feedback/      # Loading, error, empty states
│
├── hooks/             # Custom React hooks
├── api/               # API client layer
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
└── styles/            # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

## Architecture Principles

### Multi-Tenant Context

Every API call automatically includes:
- `tenant_id` - Brand/tenant identifier
- `store_id` - Store identifier

Context is managed globally via `TenantStoreProvider`.

### Frontend Responsibilities

**Frontend is READ-ONLY for business logic:**
- ✅ Display data from backend
- ✅ Form validation (visual)
- ✅ UI state management
- ❌ NO pricing calculations
- ❌ NO inventory calculations
- ❌ NO tax calculations
- ❌ NO business rule enforcement

All computed values come from the backend.

### Component States

Every data-driven component must support:
- **Loading state** - While fetching data
- **Empty state** - When no data exists
- **Error state** - When requests fail

### Design System

Following Clover Admin Dashboard design patterns:
- Dense, data-heavy layouts
- Neutral color palette with subtle green accents
- Left sidebar navigation
- Enterprise SaaS aesthetic

## Development Guidelines

1. **TypeScript Strict Mode** - All code must pass strict type checking
2. **No Mock Data** - Use real API endpoints (or placeholder components)
3. **Path Aliases** - Use `@/` imports for cleaner code
4. **Component Composition** - Build with reusable, focused components
5. **Responsive Design** - Desktop-first, tablet-compatible

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Proprietary - All rights reserved
