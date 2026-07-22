# StockPro — AI Working Instructions

This file briefs any AI assistant (Claude Code or otherwise) before it touches this
repository. Read it before making changes. It documents decisions that are **not**
derivable from reading the code alone — the *why* behind the stack, the invariants
that must never be broken, and the traps this specific stack has already bitten us
with.

## What this project is

StockPro — a multi-tenant inventory management SaaS. Two portals share one app:

- **Admin** (`OWNER` / `ADMIN` role) — full catalog CRUD, user management, approves
  or rejects stock requisitions, confirms returns.
- **User** (`MEMBER` role) — browses the catalog, submits requisitions ("เบิกสินค้า"),
  requests returns ("แจ้งคืนสินค้า"), tracks their own request history.

The two portals are one Next.js app, not two apps: same login page (tab-switched
between Admin Login / User Login), same session, role read from the JWT
(`session.user.role`), UI and available routes branch on `isAdminRole(role)`.

## Tech stack (fixed — do not swap without asking)

Next.js 16 (App Router) · strict TypeScript · Prisma 7 + `@prisma/adapter-pg` ·
Supabase PostgreSQL · Auth.js v5 (Credentials provider only — no OAuth) ·
shadcn/ui + Tailwind v4 · Zod 4 · React Hook Form · TanStack Table · Recharts ·
ExcelJS (planned, M3) · Zustand (only if a feature genuinely needs client global
state — most of this app doesn't).

## Architecture

```
src/app/(auth)/…        route group: sign-in, sign-up — redirects signed-in users away
src/app/(app)/…          route group: everything behind requireSession()/requireAdmin()
src/features/<name>/     one folder per domain feature
  schemas.ts             Zod schemas, shared client + server
  queries.ts              server-only reads (`import "server-only"`), return plain
                          serializable row types — never a raw Prisma entity
  actions.ts              "use server" mutations, always tenant-scoped
  components/             feature-local client components
src/components/shared/    reusable app-level pieces: DataTable, EmptyState,
                          PageHeader, ConfirmDialog, FormRootError
src/components/ui/        generated shadcn/ui primitives — don't hand-edit, re-run
                          `npx shadcn add <name>` instead
src/lib/                  cross-cutting infra: prisma client, auth.ts, session.ts,
                          roles.ts, action-result.ts, format.ts, slug.ts
```

### Invariants — breaking these is a bug, not a style choice

- **Tenant isolation.** Every query and mutation filters by `organizationId` from
  `requireSession()`/`requireAdmin()`. Mutations use `updateMany`/`deleteMany` (not
  `update`/`delete`) so the org filter is part of the `WHERE`, and a foreign-tenant id
  matches zero rows instead of throwing or leaking.
- **Role gating happens twice.** Once in the page/layout (`requireAdmin()` redirects
  members away), and again inside every mutation action that only admins may call —
  never rely on the UI hiding a button as the only guard.
- **Stock is a ledger, never a mutable counter.** `Product.quantity` is a cached
  balance; every change to it happens in the same transaction as a `StockMovement`
  row (`IN` / `OUT` / `ADJUSTMENT`, signed `delta`). Never write to `quantity`
  outside that pattern — the requisition approve/return actions in
  `src/features/requisitions/actions.ts` are the reference implementation.
- **Serialization boundary.** `queries.ts` converts Prisma output (Decimal, Date,
  relations) into plain types before it reaches a client component — Decimal
  instances and Date objects don't survive the RSC boundary. Dates cross as ISO
  strings; format them client-side with `formatDateThai()` from `src/lib/format.ts`.
- **`ActionResult<T>`, not thrown errors, for expected failures.** Every server
  action returns `ok(data)` or `fail(message, fieldErrors?)` from
  `src/lib/action-result.ts`. Client forms branch on `result.ok`. Reserve actual
  `throw` for genuinely unexpected states (a caught error you don't have a
  recovery message for) — see the `RequisitionError` pattern for turning an
  in-transaction failure into a user-facing message without leaking a raw 500.
- **Never reveal account/role information before a password is verified.**
  `signInAction` used to look up an email's role first to validate the login
  tab choice, which let anyone submit a real email with a wrong password and
  learn whether the account exists and whether it's an admin — no valid
  credentials required. `verifyCredentials()` in `src/lib/auth.ts` is now the
  single place that checks a password; it's used by both NextAuth's
  `authorize()` and `signInAction`, and role/account-existence must never be
  branched on before it returns a match. Apply the same rule to any future
  check that depends on "does this email/account have property X" — verify
  the password first, always.
- **Login attempts are rate-limited.** `verifyCredentials()` calls into
  `src/lib/login-rate-limit.ts`, which locks an email out for 15 minutes
  after 5 failed attempts within that window (counted regardless of whether
  the email belongs to a real account, so lockout timing doesn't leak
  account existence either). The store is an in-memory `Map`, correct only
  for a single-process deployment (matches the current standalone Docker
  container) — if this app is ever horizontally scaled to multiple
  instances, swap it for a shared store (Redis, DB row) or each instance
  will track attempts independently and the limit becomes trivially
  bypassable by hitting different instances.

## Language & UI conventions

- **All UI copy is Thai.** Labels, buttons, toasts, empty states, error messages —
  Thai. Code identifiers, comments, commit messages stay English.
- **No emoji anywhere in the UI or code.** Use `lucide-react` icons instead — this
  project already depends on it. Pick a semantically matching icon (`CircleCheck`
  for a positive empty state, `AlertTriangle` for a warning, etc.), size it with
  `className="size-4"` (or `size-5`/`size-6` depending on context), and always add
  `aria-hidden="true"` since the icon is decorative next to a text label.
- **Dates.** Use `formatDateThai()` (`th-TH`, Buddhist calendar, e.g. "9 ก.ค. 2569")
  — never a raw `Date` or ISO string in the UI.
- **Money.** Use `formatMoney()` from `src/lib/format.ts`.
- **Confirmation before destructive/state-changing actions.** Use
  `<ConfirmDialog>` (`src/components/shared/confirm-dialog.tsx`) — it defaults to
  the destructive red styling; pass `variant="default"` for non-destructive
  confirmations (e.g. approving a requisition).
- **Charts.** Follow the `dataviz` skill/method if you add or touch a chart — the
  categorical palette for the existing movement chart lives in `globals.css` as
  `--viz-in` / `--viz-out` (validated for CVD-safety and contrast, light + dark).
  Don't invent new chart colors ad hoc; extend the same validated palette.

## Known stack gotchas (as of Next 16.2 / Prisma 7.8 / Zod 4.4)

- **Prisma 7**: generator is `prisma-client` with a required `output`
  (`src/generated/prisma`, gitignored). Import `PrismaClient`/`Prisma` from
  `@/generated/prisma/client`, enums from `@/generated/prisma/enums`. The CLI does
  **not** auto-load `.env` — `prisma.config.ts` imports `dotenv/config` itself.
  After any `schema.prisma` change, run `npx prisma generate` (or `db:migrate`,
  which does it for you) before typechecking, or you'll get stale-type errors that
  look like real bugs but aren't.
- **Supabase pooled connection is slow from this environment.** Plain queries are
  fine, but `prisma.$transaction()` can exceed the 2s/5s defaults and throw
  `P2028` ("Unable to start a transaction in the given time"). The Prisma client
  in `src/lib/prisma.ts` already raises `transactionOptions` to
  `{ maxWait: 10_000, timeout: 15_000 }` — keep that in place. Any **new**
  `$transaction` call in an action should still catch `P2028` explicitly and
  return a friendly `fail("ระบบทำงานช้าในขณะนี้ กรุณาลองใหม่อีกครั้ง")` rather than
  letting it surface as a raw 500 (see `isTransactionTimeout()` in
  `src/features/requisitions/actions.ts` for the pattern).
- **Next 16**: middleware is `src/proxy.ts` (`export default function proxy`), not
  `middleware.ts`. Keep it edge-light (cookie presence check only) — real
  authorization happens in `requireSession()`/`requireAdmin()` server-side.
- **shadcn CLI 4.13**: `-b` now selects the base library (`radix` | `base`), not a
  base color. Use `npx shadcn add <component> -y` for new primitives.
- **Zod 4**: `.email()` and `.flatten()` are deprecated-but-functional; used
  throughout this codebase, don't "fix" them.
- **React Compiler / eslint**: `useReactTable()` and React Hook Form's `watch()`
  trip the `react-hooks/incompatible-library` warning (compiler skips memoizing —
  expected, not a bug, already present before this file existed). Genuine
  `react-hooks/set-state-in-effect` errors should be fixed by not calling a
  `useState` setter inside an effect where avoidable; the one sanctioned exception
  in this codebase (hydrating "remember email" from `localStorage`) is
  documented inline with an `eslint-disable-next-line` and a comment explaining
  why — follow that precedent rather than restructuring around it if you hit the
  same pattern.
- **Radix `<Select>` + browser automation**: if you're driving the UI with a
  browser tool, a single mouse click on a `<Select>` with exactly one option can
  visually appear to select it without actually committing the value (the option
  renders directly on top of the trigger). Open with a click, then commit with
  `ArrowDown` + `Enter` rather than a second click at the same coordinate.

## Roles reference

`MembershipRole` enum: `OWNER`, `ADMIN`, `MEMBER`. `isAdminRole(role)` in
`src/lib/roles.ts` treats `OWNER` and `ADMIN` as the same "admin" UI/permission
tier — `OWNER` is only distinguished from `ADMIN` in `/users` (an owner's role
can't be changed or removed via the UI). Never grant `OWNER` from an in-app
action; it's assigned exactly once, at sign-up, to the org creator.

**Platform admin is a separate axis from `MembershipRole`.** `User.isPlatformAdmin`
(a boolean, not a role) gates deployment-wide state — currently just
`SystemSetting` (branding/logo, sign-in page copy) via `requirePlatformAdmin()`
in `src/lib/session.ts`. It exists because anyone can self-sign-up and become
`OWNER` of a brand-new org (see the sign-up flow in
`src/features/auth/actions.ts`), so gating cross-tenant state on org-level
`ADMIN`/`OWNER` would let any self-registered org owner overwrite settings
shared by every organization on the install. Nothing in the UI grants this
flag — it's set directly in the database for whoever operates the deployment.

## Requisition status machine

```
PENDING → APPROVED → RETURN_REQUESTED → RETURNED
   ↓
REJECTED
```

Only forward transitions exist; there is no "un-approve." `approveRequisitionAction`
and `confirmReturnAction` are the only two places that touch `Product.quantity`
for this flow — both go through the ledger pattern above.

## Commands

```bash
npm run dev         # Turbopack dev server
npm run typecheck   # tsc --noEmit — run before calling anything done
npm run lint        # eslint — run before calling anything done
npm run db:migrate  # prisma migrate dev (also regenerates the client)
npm run db:generate # prisma generate only, after a schema.prisma edit
```

Before reporting a change as complete: `npm run typecheck` and `npm run lint`
must both be clean (0 errors — the two pre-existing `incompatible-library`
warnings from TanStack Table / React Hook Form are expected and not something to
chase). For anything touching a user-facing flow, drive it in the browser as
both an Admin and a User account rather than trusting types alone — this app has
already surfaced one real bug (the P2028 transaction timeout above) that only
showed up under real interaction, not under typecheck/lint.

## Roadmap / milestone status

- [x] M0 — scaffold, multi-tenant schema, credentials auth, app shell
- [x] M1 — categories & products CRUD (admin), read-only catalog view (user)
- [x] M1.5 — role-split login, admin/user dashboards, requisition (เบิก/คืน) flow,
      user management
- [ ] M2 — stock movements: receiving inventory (รับเข้า), full movement ledger UI
- [ ] M3 — reports, Excel export (ExcelJS)
- [ ] M4 — suppliers & purchase orders

`/stock`, `/suppliers`, `/purchase-orders`, `/reports` currently render a
`<ComingSoon>` placeholder (gated behind `requireAdmin()`) rather than a stub CRUD
UI — that's deliberate, keep using that pattern for not-yet-built admin sections
instead of half-built pages.
