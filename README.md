# Landmark Inter Gulf — Workforce, Payroll & Accounts System

A complete, production-ready web admin system for a **construction manpower / workforce supply company** (Saudi Arabia, currency **SAR**). It manages clients, projects, staff (workers with Iqama IDs), worker deployment, attendance, monthly payroll, salary slips with signature blocks, salary sheets, and company income/expense accounting.

Built with **Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Prisma + SQLite · Recharts**.

---

## Features

### Dashboard
- Gradient stat cards: Total Staff, Total Users, Total Income, Total Expense, Net Balance (red when negative), Salary Paid — each with a "More info" link.
- **Financial Performance (Last 6 Months)** smooth area chart (income green / expense red).
- **Payroll Status** for the current month and **Workforce by Client** (top client companies by deployed workers).
- **Document Compliance alerts** — workers with expired or soon-expiring (≤ 90 days) Iqama, right on the dashboard.
- **Recent Activity** feed (payroll payments, transactions, staff/project changes, logins, exports).
- Quick actions: Add Income / Add Expense.

### Clients & Worker Deployment
- **Clients**: full CRM for the client companies you supply workforce to — contact person, phone/email links, city, CR number, status, notes; per-client detail dialog with projects, financials and the distinct workers deployed.
- **Worker Deployment** ("who works where"): grouped by client company → project → worker (with category and rate), plus a flat **By Worker** view with search/filters (client, project, category, status, unassigned bench) and CSV export.

### Project Management
- Project directory with search, status filters, pagination (10/25/50), checkbox selection, client-company link.
- Create / edit / view (with assigned workforce list) / delete — projects in use cannot be deleted (friendly error).

### Staff Management
- **Staff List**: searchable (name or IQAMA), filter by project / category / status / **Iqama expiry**; avatars, category badges, assigned-project chips, quick-stat chips, CSV export, soft delete.
- **Document Compliance**: Iqama & passport expiry tracking — expired rows tinted red, "In N days" badges, dedicated dashboard alert card (90-day window).
- **Add/Edit Staff**: full profile (IQAMA unique, joining date, hourly + overtime rates, monthly salary), profile-photo upload (client-resized), residential address, Iqama/passport expiry dates, multi-project assignment via checkbox grid.
- **Staff Categories**: 13 seeded job categories (PIPING QCI, PIPING WELDER, RIGGER, HELPER, …), CRUD with in-use protection.
- **Staff Attendance**: check-in / check-out records with auto-computed durations displayed in human format (`8h 30m`, `2w 1d`), filters by staff / project / date range, live duration preview in the form.
- **Payroll**: monthly payroll processing — searchable staff dropdown (`NAME — IQAMA: 2471889914`), "Profile Rate" badge with auto-filled rate snapshots, **"Fill hours from attendance"** button, Fixed/% **Other Deductions** toggle with live helper text, **live net-pay calculation** (also re-calculated server-side — client values are never trusted), duplicate-payroll prevention (409), and **Paid payroll → automatic linked Salary expense** (created / updated / removed with the payroll).
- **Salary Sheet**: monthly sheet with all spec columns, totals footer, staff-category breakdown, and a **printable A4 landscape page** (serial numbers, totals row, category breakdown with grand total, Receiver / Accountant / Manager signature blocks).
- **Staff Salary Summary**: top cards (Total Manpower / Gross / Deductions / Disbursement) + category-wise breakdown with **Share % progress bars**, zero rows at the bottom, printable.
- **Salary Slip**: per-payroll A4 print page — company header, info block, EARNINGS / DEDUCTIONS tables side-by-side, red total deductions, dark **NET SALARY PAYABLE** bar, **PAID / Pending stamp**, and an **Approval & Acknowledgment** section with **Prepared By / Approved By / Received By** signature lines and date lines (the money receiver signs on collection). Fits exactly one A4 page; print or save as PDF via the browser dialog.

### Account Research (Accounting)
- **Income / Expense Lists**: transaction info, category badges, colored amounts, operator, date; filters by category / project / date range; **Print Statement**; payroll-linked rows are locked ("Managed via Payroll module").
- **Summary**: totals, monthly performance chart, income/expense by category with progress bars, date-range + project filters, printable financial statement.
- **Categories**: CRUD for income / expense categories with in-use protection.

### Administration
- **Roles & Permissions**: permission matrix per module (view / create / edit / delete / print), full-access switch, Super Admin protected.
- **Users**: CRUD with role assignment, avatar upload, active toggle; self-delete and last-Super-Admin deletion blocked; **change password** with strength meter.
- **Activity Log**: full audit trail — who did what, when, with module/action filters, search, pagination, CSV export and relative timestamps.
- **Settings**: company name, address, phone, email, logo upload, currency (SAR), default pay type, **authorized signatory (name + title — printed on every salary slip)**, and **JSON backup export** (all tables, passwords/sessions excluded).
- **Self-healing bootstrap**: if the database is ever empty, the login screen detects it and offers one-click initialization of the demo dataset.

### Platform
- Cookie-based auth (scrypt password hashing, server-side sessions).
- Command palette (Ctrl/Cmd+K): global search across staff, projects, clients, payrolls + quick actions and navigation.
- Dark mode (moon toggle), fully responsive (mobile drawer sidebar), toast notifications, confirm-before-delete dialogs.

---

## Payroll Business Rules

```
regular_pay   = total_hours_worked × hourly_rate
overtime_pay  = overtime_hours × overtime_rate
gross_pay     = regular_pay + overtime_pay + other_earnings
other_deduction_amount = (type == percent) ? gross_pay × value / 100 : value
total_deductions = advance + absent_penalty + pt_amount + union_fees + other_deduction_amount
net_pay       = gross_pay − total_deductions   (never below 0; warning if negative)
```

**Verification example** (implemented and verified end-to-end — form, list, slip, print):
`200 hrs × 75 = 15,000; other earnings 100 → gross 15,100; union fees 200; other deductions 10% = 1,510 → total deductions 1,710 → NET PAY SAR 13,390.00`

All money is displayed as `SAR 13,390.00` (tabular numerals).

---

## Getting Started

### Prerequisites
- [Bun](https://bun.sh) (or Node.js 20+)

### Setup

```bash
# 1. Install dependencies
bun install

# 2. Configure environment
cp .env.example .env   # DATABASE_URL=file:../db/custom.db

# 3. Create the database schema
bun run db:push

# 4. Seed realistic demo data (40 staff, 6 clients, 6 projects, payrolls, transactions…)
bun run db:seed

# 5. Start the dev server
bun run dev            # http://localhost:3000
```

> If you ever start with an empty database, the login screen itself offers a one-click **Initialize demo data** button.

### Demo Login

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@example.com` | `password` |
| Accountant | `accountant@example.com` | `password` |
| HR Manager | `hr@example.com` | `password` |
| Viewer | `viewer@example.com` | `password` |

### Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Next.js dev server (port 3000) |
| `bun run lint` | ESLint (Next.js + React rules) |
| `bun run db:push` | Push `prisma/schema.prisma` to SQLite |
| `bun run db:seed` | Seed demo data (idempotent — wipes & reseeds) |
| `bun run db:generate` | Regenerate Prisma Client |
| `bun run build` | Production build (standalone output) |
| `bun run start` | Run the production build |

> **Ops note:** after running `db:push`, restart the dev server — the running process keeps the old Prisma client in memory.

---

## Project Structure

```
prisma/schema.prisma        # Data model (users, roles, clients, projects, staff,
                            # attendance, payrolls, transactions, settings, activity log)
prisma/seed.ts              # Thin CLI wrapper around src/lib/seed-data.ts
src/app/page.tsx            # The single-page admin app (SPA shell)
src/app/api/**              # REST API route handlers (Next.js App Router)
src/components/app/**       # App shell, views (one per module), print documents
src/components/ui/**        # shadcn/ui component library
src/lib/                    # Shared code:
  payroll.ts                #   Payroll calculation (single source of truth)
  auth.ts                   #   scrypt hashing + cookie sessions
  api-helpers.ts            #   Responses, auth guards, pagination, activity log
  expiry.ts                 #   Document-expiry status helpers (client + server)
  seed-data.ts              #   Deterministic demo dataset (used by seed + bootstrap)
  format.ts                 #   Money/date/duration formatting
  types.ts                  #   Shared TypeScript types
  store.ts                  #   Zustand client state (user / settings / view)
  permissions.ts            #   Permission catalog
scripts/                    # One-off backfill utilities (expiry dates, clients, …)
```

### API Overview

All endpoints are JSON, cookie-authenticated, permission-checked (401/403/409 friendly errors):
`/api/auth/*` (+ `change-password`) · `/api/bootstrap` · `/api/dashboard` · `/api/clients` · `/api/deployments` · `/api/projects` · `/api/staff` · `/api/staff-categories` · `/api/attendance` (+ `/hours`) · `/api/payrolls` (+ `/sheet`, `/summary`) · `/api/transactions` · `/api/transaction-categories` · `/api/accounts/summary` · `/api/roles` · `/api/users` · `/api/settings` · `/api/activity` · `/api/search` · `/api/backup`

---

## Quality Notes

- Payroll totals are **always re-computed server-side** from raw inputs (`src/lib/payroll.ts` is the single source of truth, shared with the live client form).
- Payroll + linked expense writes run inside **Prisma transactions**.
- Duplicate payrolls (staff + project + month + year) are blocked with a friendly 409.
- In-use categories/projects/roles/clients cannot be deleted.
- No N+1 queries (relations are eager-loaded).
- The salary slip is verified to fit **exactly one A4 page** including the signature section.
- Verified end-to-end with automated browser QA: login, all 18 views, create/edit/delete flows, live payroll calculation, paid→expense linking, dark mode, mobile layout (390 px), and print/PDF output of salary slip / salary sheet / statements.

## Deployment (GitHub → server)

```bash
git clone <your-repo-url> && cd <repo>
bun install
cp .env.example .env
bun run db:push && bun run db:seed   # seed optional in production
bun run build && bun run start       # standalone server
```

Put the app behind Nginx/Caddy with HTTPS; the SQLite file lives in `db/custom.db` (back it up regularly — or use the built-in JSON backup in Settings). To reset demo data: `bun run db:seed`.

---

## Development Log

See [`worklog.md`](worklog.md) for the detailed round-by-round development and QA history (features, verification results, known non-blocking items).
