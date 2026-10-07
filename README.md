# Relay

Customer Operations Workspace

## Live Demo

Production demo: <https://tugas-seven-eta.vercel.app>.

Run it locally at `http://localhost:3000` to explore the prototype.

## Why I Built This

Relay is a focused frontend engineering sample for a Junior Frontend Developer application to Atorline. I wanted to show how a small operations product can make prioritization, ownership, and recovery from errors clear across a complete workflow.

## The Problem

Customer operations specialists need to understand their workload, find urgent requests, keep an eye on service deadlines, and move cases toward resolution. A queue is only useful when its filters are shareable and its actions give clear feedback when an update does not work.

## Product Workflow

The main path is **Overview → Cases → Search and filter → Case details → Update ownership or status → Add an internal note → Resolve**. A second path lets a teammate create a case, validate its details, and open the new record.

## Core Features

- Operations overview with open, high priority, near SLA, and resolved today counts.
- A 120 case queue with server side search, status, priority and assignee filters, six sort orders, pagination, and URL persistence.
- Desktop semantic table and purpose designed mobile case cards.
- Case details with customer context, SLA, tags, activity history, internal notes, and editable status, priority, and assignee.
- Optimistic updates with rollback, readable error feedback, and retry.
- A validated create case form with customer and assignee data, priority, and up to five tags.
- Searchable customer API, users API, and case collection, detail, create, update, and note API routes.
- A quality page for interface examples and opt in API failure and empty state simulation.

## Technology

- Next.js App Router and React
- TypeScript
- Tailwind CSS 4 with a small set of CSS design tokens and authored component styles
- TanStack Query for remote state
- React Hook Form and Zod for forms and validation
- Vitest and React Testing Library for unit and component integration behavior
- Playwright projects for Chromium, Firefox, and WebKit
- npm for package management in this workspace

## Architecture

The code is organized by feature under `src/features`. App Router pages stay small and compose feature views. API route handlers validate request input and call a single in memory repository seeded from deterministic demo records. The repository holds mutations for the lifetime of the running server process; restarting the server resets the prototype data.

The API uses a consistent `{ data }` success shape and `{ error: { code, message } }` failure shape. Collection responses also include page metadata. Route handlers add a short artificial delay and support controlled demo failure modes through a request header set by the Quality page.

## Component Boundaries

Reusable UI primitives such as `Button`, `Input`, `Select`, `Badge`, and `EmptyState` handle presentation and basic interaction. They do not know what a case or customer is. Case components such as `CaseStatusBadge`, `CaseFilters`, and `CaseActivityTimeline` deliberately know the case domain. Keeping these boundaries explicit makes shared controls reusable without stripping product meaning from domain behavior.

The shell owns persistent desktop navigation and an accessible mobile drawer. Queue, dashboard, create form, and detail components live with their respective features. Loading and empty states are shaped for the screen they represent instead of reusing one generic placeholder everywhere.

## State Strategy

- TanStack Query owns cases, users, customers, and remote mutations.
- Search, filters, sorting, and pagination live in URL query parameters so a view can be reloaded or shared.
- React Hook Form owns create form values and field errors.
- Component state owns temporary details such as the mobile drawer, internal note draft, and toast messages.
- No Redux store is used because the product has no cross page client state that justifies one.

## API Design

The local API mirrors the main operations a production client needs:

- `GET /api/cases` filters, searches, sorts, and paginates in the repository layer.
- `GET /api/cases/[caseId]` returns a full case and activity or a structured 404.
- `POST /api/cases` validates input on the server and returns the new case identifier and number.
- `PATCH /api/cases/[caseId]` accepts only mutable case fields and records activity for actual changes.
- `POST /api/cases/[caseId]/notes` validates and appends an internal note.
- `GET /api/users` and `GET /api/customers?search=` supply selector options.

## Accessibility

Pages use semantic landmarks, a logical heading order, labeled native controls, a semantic data table, and visible keyboard focus. Status, priority, and SLA labels include text in addition to color. The mobile navigation announces its expanded state, acts as a modal dialog, closes with Escape, traps keyboard focus, and restores focus to its trigger when dismissed.

Create form errors are connected to fields with `aria-describedby` and `aria-invalid`. Toasts and important failures use live regions. Reduced motion preferences are respected.

## Error Handling

Important requests show a useful loading state, a readable error, and a recovery action. Queue failures can be retried; case detail failures offer retry and a route back to the queue. Failed optimistic changes restore the prior cached case. Failed internal note and create requests keep the user's draft and entered form values.

The Quality page can store a demo mode in the current browser: fail reads, fail changes, or return an empty queue. Clear the mode from that page to restore normal behavior.

## Testing Strategy

Tests protect SLA boundaries and formatting, filter URL parsing and serialization, create and note validation, invalid create form submission, and optimistic rollback. Playwright covers URL based filtering, detail updates, create case validation and redirection, failed mutation rollback, internal notes, keyboard drawer behavior, and viewport overflow. Run the automated suites with the commands below.

## Performance

The prototype avoids charting packages, external image requests, and remote font loading. Queue reads are paginated, list and detail queries are separate, UI primitives are small, and the client bundle does not import the demo case seed. Loading placeholders reserve the main layout dimensions. No Lighthouse score is claimed because a deployed production build has not been measured with Lighthouse.

## Browser Testing

Playwright is configured for Chromium, Firefox, and WebKit, the engine used by Safari. The workflow tests run across the configured engines, with a viewport sweep at 320, 375, 430, 768, 1024, 1280, and 1440 pixels in Chromium. Browser coverage does not replace testing on physical iOS and Android devices.

## Tradeoffs

- Demo records live in memory, so changes reset when the server restarts and are not suitable for multiple production instances.
- Seed timestamps are generated once per server process relative to its start so SLA examples remain useful while behavior stays stable during a session.
- The customer selector is a native select because the prototype has eight customers and does not need a custom searchable combobox.
- The application uses a small authored component system rather than a large component library so the product can demonstrate its own semantic and responsive decisions.

## What I Deliberately Did Not Build

Authentication, OAuth, role management, durable storage, payments, realtime features, charts, and AI behavior are outside this prototype's product workflow. They would add infrastructure without improving the evidence this project is intended to provide.

## If This Were Production

I would add a persistent database, authentication, authorization and appropriate RBAC, audit logs, observability and monitoring, rate limits, secure customer data handling, database indexes, server owned SLA calculations, background jobs, and versioned API contracts. I would also define retention and access policies for customer and internal note data.

## Running Locally

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run start
```

Playwright setup and end to end checks:

```bash
npx playwright install chromium firefox webkit
npm run test:e2e
```

The GitHub Actions workflow runs install, lint, typecheck, unit and integration tests, browser tests, and a production build.

## Prototype Disclaimer

Relay uses deterministic demo data for frontend evaluation. Its API surface mirrors a production application, while durable persistence and authentication are intentionally outside prototype scope.
