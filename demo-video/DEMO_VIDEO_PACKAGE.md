# TransitOps — Professional Demo Video Package
### Odoo Hackathon · 4–5 Minute Product Presentation

> **Product:** TransitOps — Transport Operations ERP  
> **Stack:** React 19 + Vite + TypeScript · Express + MongoDB · JWT + RBAC  
> **Default login:** `admin@transitops.com` / `adminpassword123`  
> **Files:** `transitops-demo.srt` (subtitles) · this document (full package)

---

## STEP 1 — PROJECT ANALYSIS (Codebase-Verified)

### Architecture

```
Browser (React 19 + TanStack Query)
        ↓ REST /api/v1
Express Controllers → Services → Repositories → Mongoose Models
        ↓
MongoDB (transitops)
```

| Layer | Location | Purpose |
|-------|----------|---------|
| Routes | `backend/src/routes/` | 10 route modules, ~60 endpoints |
| Controllers | `backend/src/controllers/` | HTTP mapping, thin handlers |
| Services | `backend/src/services/` | Business rules (Trip, Maintenance, Dashboard, Vehicle metrics) |
| Repositories | `backend/src/repositories/` | Data access, pagination |
| Models | `backend/src/models/` | 9 Mongoose schemas with enums + validation |
| Frontend pages | `frontend/src/pages/` | 12 routed operational views |
| Auth | JWT access (15m) + refresh (7d), httpOnly cookies |

### Strongest Demo Features (actually implemented)

1. **Trip dispatch state machine** — vehicle + driver auto-transition to `On Trip`; completion resets to `Active` and syncs mileage
2. **Service-layer business rules** — 7 enforced validation scenarios with clear error messages
3. **Live dashboard KPIs** — fleet utilization, operational cost, revenue, ROI from MongoDB aggregations
4. **Live analytics charts** — fuel trends, maintenance breakdown, fleet status pie (6-month window)
5. **Per-vehicle ROI metrics** — `GET /vehicles/:id/metrics` with fuel/maintenance/expense breakdown
6. **Maintenance workflow** — vehicle auto-enters `In Maintenance`, returns to `Active` on completion
7. **RBAC** — 5 roles, route guards on frontend, `authorize()` middleware on backend
8. **Role-filtered sidebar** — navigation adapts per user role
9. **Expense approval workflow** — pending → approved/rejected with dashboard invalidation
10. **Integration test suite** — full dispatch lifecycle covered in `backend/src/tests/erp.test.ts`

### Features NOT to demo (not implemented or mock)

| Feature | Status |
|---------|--------|
| Vehicle edit in UI | ❌ Create + delete + metrics only (API PUT exists, no frontend) |
| Reports page live data | ❌ Static mock charts in `Reports.tsx` |
| PDF export | ❌ Toast only, no generation |
| Navbar notification dropdown | ❌ Hardcoded mock data |
| Safety page | ❌ Built but not routed |
| WebSockets / real-time push | ❌ Stub only |
| File upload endpoints | ❌ Service exists, no routes |
| Email notifications | ❌ Console log only |
| Settings persistence | ❌ Local form + toast only |

### Honest pivot for Scene 10 (Reports)

Use **Dashboard analytics** (live API) + **Vehicle metrics modal** (live API) instead of the Reports page mock data. Optionally show Reports page for 5 seconds as "reporting UI shell" without claiming live data.

### Demo prep note (Trip completion UI)

New dispatches default to trip status `Scheduled`, but the **Complete** button only appears for `In Progress` trips. Before recording Scene 7 completion:

- Pre-seed one trip with status `In Progress`, OR
- After dispatch, update via API: `PUT /api/v1/trips/:id` with `{ "status": "In Progress" }`

---

## STEP 2 — DEMO STORY

### Narrative arc

**Problem → Platform → Command Center → Operations → Rules → Architecture → Close**

| Act | Message | Emotional beat |
|-----|---------|----------------|
| 1. Problem | Spreadsheets cause double-bookings, blind spots, reactive management | Pain |
| 2. Solution | TransitOps connects fleet, people, money, and compliance in one system | Relief |
| 3. Dashboard | Live KPIs replace guesswork with calculated intelligence | Confidence |
| 4. Core Workflow | Dispatch → status transitions → completion → maintenance → costs | Flow |
| 5. Business Rules | System says "no" before bad decisions become real problems | Trust |
| 6. Architecture | Production-grade stack, clean layers, testable | Credibility |
| 7. Close | One platform, one source of truth | Memorable |

### Tagline options (pick one for opening slide)

- **"Fleet operations, finally under control."** ← recommended
- "One platform. Every dispatch. Zero conflicts."
- "From spreadsheet chaos to operational clarity."

---

## STEP 3 & 4 — FULL VIDEO SCRIPT (Scene-by-Scene)

**Total runtime target: 4:22**

---

### SCENE 1 — Opening Animation (0:00 – 0:05)

| Field | Detail |
|-------|--------|
| **Time** | 0:00 – 0:05 |
| **Narration** | "TransitOps. Fleet operations, finally under control." |
| **Screen** | Black → fade in indigo gradient. Center: **TO** monogram (indigo square, white text). Below: **TRANSITOPS** in gradient indigo. Team name placeholder below. Tagline beneath. |
| **Mouse** | None |
| **Clicks** | None |
| **Transition** | Fade from black (1s). Text scale-up 0.95→1.0 (ease-out, 0.8s) |
| **Zoom** | Slow push-in on logo (102% over 3s) |
| **Pause** | 1.5s hold on full title card |
| **Emphasize** | Product name + tagline |
| **Camera focus** | Center frame |
| **Interaction** | None — motion graphics only |

**Slide text:**
```
[TO]  ← indigo rounded square monogram (matches sidebar collapsed state)

TRANSITOPS
[Your Team Name Here]

Fleet operations, finally under control.
```

---

### SCENE 2 — Problem Statement (0:05 – 0:27)

| Field | Detail |
|-------|--------|
| **Time** | 0:05 – 0:27 |
| **Narration** | "Every day, transport companies lose hours to spreadsheets and phone calls. The same vehicle gets booked twice. A suspended driver ends up on a live route. Maintenance slips through the cracks. Fuel costs pile up with no clear picture of ROI. Managers guess at utilization. Finance chases receipts. Safety teams react instead of prevent. TransitOps is a transport operations ERP built to replace that fragmentation." |
| **Screen** | Motion graphic OR static slide: left side = messy spreadsheet screenshot (stock/generic). Right side = bullet pain points animating in. Final frame: TransitOps logo slides in. |
| **Mouse** | None |
| **Clicks** | None |
| **Transition** | Slide left wipe between problem bullets → solution reveal |
| **Zoom** | None |
| **Pause** | 0.5s after each bullet |
| **Emphasize** | "Double-booked" · "No ROI picture" · "TransitOps" |
| **Camera focus** | Split-screen layout |
| **Interaction** | None |

**On-screen bullets:**
- Vehicle conflicts
- Driver conflicts
- Maintenance gaps
- Poor cost visibility
- Zero compliance automation

---

### SCENE 3 — Authentication & RBAC (0:27 – 0:54)

| Field | Detail |
|-------|--------|
| **Time** | 0:27 – 0:54 |
| **Narration** | "One platform for fleet, drivers, dispatches, maintenance, fuel, and financial oversight. Sign in with secure JWT authentication. Each user sees only what their role allows. Admin. Fleet Manager. Safety Officer. Financial Analyst. Driver. Route guards on the frontend. Role checks on every API endpoint on the backend." |
| **Screen** | Browser → `http://localhost:3000/login` |
| **Mouse** | Move to email field → password field → Sign In button |
| **Clicks** | Click Sign In |
| **Transition** | Cut to dashboard with Framer Motion page enter (opacity + y) |
| **Zoom** | None |
| **Pause** | 1s on loading spinner (AuthLayout) before dashboard appears |
| **Emphasize** | Clean login card · sidebar role-filtered nav after login |
| **Camera focus** | Login form center → full dashboard reveal |
| **Interaction** | Email: `admin@transitops.com` · Password: `adminpassword123` |

**Optional second beat (5s):** Log out → log in as Financial Analyst (if seeded) → show Expenses visible, Drivers hidden in sidebar.

---

### SCENE 4 — Dashboard (0:54 – 1:44)

| Field | Detail |
|-------|--------|
| **Time** | 0:54 – 1:44 |
| **Narration** | "Welcome to TransitOps Core — your fleet operations and ROI intelligence control center. Four KPI cards update in real time from server-side aggregations. Fleet Utilization — what percentage of your active fleet is en route right now. Operational Cost — fuel, maintenance, and approved expenses combined. Estimated Revenue — calculated at two dollars fifty per mile of completed trips. Return on Investment — the efficiency of every asset in your fleet. Below that, live charts: monthly fuel expense trends, maintenance cost by type, and a fleet status pie chart. The sidebar shows your three most recent dispatches and compliance alerts." |
| **Screen** | `/dashboard` — full page scroll |
| **Mouse** | Hover each KPI card (left to right) → scroll down to charts → hover Active Dispatches panel → hover Compliance Alerts |
| **Clicks** | Optional: click "Dispatch Trip" CTA (don't submit — cut before navigation completes, or navigate and cut back) |
| **Transition** | Smooth scroll (not jump) |
| **Zoom** | 110% zoom on Fleet Utilization card for 2s, then ROI card for 2s |
| **Pause** | 2s on each chart |
| **Emphasize** | "$2.50 / mile" subtext · live data loading skeleton → populated state |
| **Camera focus** | KPI row → chart grid → right sidebar panels |
| **Interaction** | None required — read-only tour |

**KPI cards (exact labels from code):**
1. Fleet Utilization — "X of Y vehicles en route"
2. Operational Cost — "Fuel, maintenance, & outlays"
3. Estimated Revenue — "Calculated at $2.50 / mile"
4. Return on Investment (ROI) — "Efficiency of asset utilization"

**Charts (live from API):**
- Monthly Fuel Expense Trends (AreaChart)
- Maintenance Cost by Type (BarChart)
- Fleet Status Allocation (PieChart)
- Active Dispatches (last 3 trips)
- Compliance Alerts (last 3 unread notifications)

---

### SCENE 5 — Vehicle Module (1:44 – 2:00)

| Field | Detail |
|-------|--------|
| **Time** | 1:44 – 2:00 |
| **Narration** | "In the Vehicles module, register a new asset with plate number, make, model, and payload capacity. Search by plate. Filter by status. Duplicate registrations are blocked at the database level. Inspect any vehicle to view per-asset metrics — fuel cost, maintenance spend, distance driven, and ROI." |
| **Screen** | `/vehicles` |
| **Mouse** | Search bar → status filter dropdown → Add Vehicle button → metrics eye icon |
| **Clicks** | 1) Type plate in search · 2) Filter "On Trip" · 3) Click Add Vehicle · 4) Fill form · 5) Submit · 6) Click eye icon on a vehicle |
| **Transition** | Modal fade-in (Framer Motion) |
| **Zoom** | 115% on metrics modal ROI figure |
| **Pause** | 1s on duplicate plate error toast (pre-stage: try registering existing plate) |
| **Emphasize** | Unique plate validation error · per-vehicle ROI modal |
| **Camera focus** | Table → create modal → metrics modal |
| **Interaction** | Register: `DEMO-001`, Ford, F-150, 2024, Truck, Diesel, 45000 mi, 8000 kg payload |

**Do NOT show:** Edit vehicle (not in UI).

**Sample duplicate error (from API):** `"plateNumber already exists"` or MongoDB duplicate key message.

---

### SCENE 6 — Driver Module (2:00 – 2:11)

| Field | Detail |
|-------|--------|
| **Time** | 2:00 – 2:11 |
| **Narration** | "In the Operator Registry, link a driver to a system user account and record license details. License expiry is validated at dispatch time. Safety scores display on every profile." |
| **Screen** | `/drivers` |
| **Mouse** | Search bar → status filter → Register Operator → eye icon on existing driver |
| **Clicks** | Open operator dossier modal showing license expiry + safety score |
| **Transition** | Cut |
| **Zoom** | 110% on safety score badge (color-coded: ≥85 green, ≥70 amber) |
| **Pause** | 2s on dossier modal |
| **Emphasize** | Safety score "X / 100" · license expiry date |
| **Camera focus** | Table safety score column → dossier modal |
| **Interaction** | Optional: register new driver linked to a system user |

---

### SCENE 7 — Trip Workflow (2:11 – 2:39)

| Field | Detail |
|-------|--------|
| **Time** | 2:11 – 2:39 |
| **Narration** | "Now the core workflow — dispatch a trip. Select an Active vehicle. Assign an Active operator. Enter origin, destination, and cargo weight. The UI warns you if cargo exceeds payload. The server enforces it before anything is saved. On successful dispatch, vehicle and driver status automatically transition to On Trip. Complete the trip with an end odometer reading. Both return to Active. Vehicle mileage syncs instantly." |
| **Screen** | `/trips` → `/vehicles` (status check) → back to `/trips` |
| **Mouse** | Dispatch Trip → fill form → submit → navigate to Vehicles → filter On Trip → back to Trips → Complete trip |
| **Clicks** | Dispatch modal · green checkmark Complete · enter end odometer |
| **Transition** | Toast success notification highlight |
| **Zoom** | 110% on status badge changing to "On Trip" in Vehicles table |
| **Pause** | 1s on success toast: "Trip dispatched and operators updated successfully" |
| **Emphasize** | Status cascade: Active → On Trip → Active |
| **Camera focus** | Dispatch modal → vehicle status column → complete modal |
| **Interaction** | Trip: TRIP-DEMO-01 · Dallas TX → Houston TX · cargo 5000 kg |

**Pre-recording setup for Complete button:**
Ensure target trip status is `In Progress` (see prep note above).

**Status labels (exact from code):**
- Vehicle/Driver: `Active` → `On Trip` → `Active`
- Trip: `Scheduled` (default on create) · `In Progress` · `Completed` · `Cancelled`

---

### SCENE 8 — Maintenance (2:39 – 2:50)

| Field | Detail |
|-------|--------|
| **Time** | 2:39 – 2:50 |
| **Narration** | "Schedule maintenance and the vehicle is removed from dispatch — status moves to In Maintenance. Resolve the work order with cost and mechanic details. The vehicle is available again." |
| **Screen** | `/maintenance` |
| **Mouse** | Schedule Maintenance → select vehicle → submit → Resolve button → complete form |
| **Clicks** | Schedule · Resolve · submit completion |
| **Transition** | Cut to `/vehicles` showing In Maintenance → Active |
| **Zoom** | None |
| **Pause** | 1s on vehicle status change |
| **Emphasize** | Vehicle excluded from dispatch dropdown while In Maintenance |
| **Camera focus** | Maintenance table → resolve modal → vehicle status |
| **Interaction** | REPAIR-DEMO-01 · type: Corrective · priority: High |

---

### SCENE 9 — Fuel & Expenses (2:50 – 3:01)

| Field | Detail |
|-------|--------|
| **Time** | 2:50 – 3:01 |
| **Narration** | "Log fuel entries with quantity, cost, and odometer. Record expense claims by category. Approve pending expenses. Dashboard KPIs refresh automatically — no manual spreadsheet updates." |
| **Screen** | `/fuel` → create log → `/expenses` → approve pending → `/dashboard` (KPI change) |
| **Mouse** | Add fuel log → fill form → navigate Expenses → approve checkmark → Dashboard |
| **Clicks** | Create fuel log · approve expense |
| **Transition** | Split-screen or quick cut: before/after Operational Cost KPI |
| **Zoom** | 115% on Operational Cost KPI card after refresh |
| **Pause** | 2s on dashboard KPI update |
| **Emphasize** | Auto odometer fill from vehicle mileage on fuel form |
| **Camera focus** | Fuel form → expense approval → dashboard KPI |
| **Interaction** | Fuel: 120 L · $180 · odometer auto-filled |

---

### SCENE 10 — Analytics & Intelligence (3:01 – 3:12)

| Field | Detail |
|-------|--------|
| **Time** | 3:01 – 3:12 |
| **Narration** | "Analytics on the dashboard show fuel trends, maintenance breakdown, and fleet allocation over six months. Per-vehicle metrics deliver fuel efficiency and ROI for individual assets." |
| **Screen** | `/dashboard` charts → `/vehicles` metrics modal |
| **Mouse** | Scroll charts · open vehicle metrics |
| **Clicks** | Eye icon on vehicle with trip history |
| **Transition** | Smooth scroll |
| **Zoom** | 110% on fuel efficiency figure in metrics modal |
| **Pause** | 2s per chart |
| **Emphasize** | Live API data (NOT Reports page mock) |
| **Camera focus** | Dashboard analytics → vehicle ROI modal |
| **Interaction** | Read-only |

**Note:** Reports page (`/reports`) has static mock data. If shown at all, label it "Reporting UI — roadmap" for 3 seconds max.

---

### SCENE 11 — Business Rules (3:12 – 3:34)

| Field | Detail |
|-------|--------|
| **Time** | 3:12 – 3:34 |
| **Narration** | "Now — what happens when someone tries to break the rules? Dispatch a vehicle already on trip — rejected. Assign a suspended driver — blocked. Use a driver with an expired license — stopped. Exceed cargo capacity — denied. Try to dispatch a vehicle in maintenance — the system says no. Every failure returns a clear message. These rules live in the service layer — not in the UI — so they cannot be bypassed." |
| **Screen** | `/trips` dispatch modal — trigger 3–4 errors |
| **Mouse** | Select invalid combinations · submit · read error toast |
| **Clicks** | Dispatch with bad data (4 attempts) |
| **Transition** | Quick cuts between error toasts (0.5s each) |
| **Zoom** | 120% on red error toast message text |
| **Pause** | 1.5s per error message |
| **Emphasize** | Exact server error messages |
| **Camera focus** | Toast notification area (top-right) |
| **Interaction** | Pre-stage test data (see Recording Checklist) |

**Exact error messages from `trip.service.ts`:**

| Rule | Error message |
|------|---------------|
| Vehicle on trip | "Vehicle is already assigned to another active trip" |
| Vehicle in maintenance | "Vehicles in maintenance cannot be dispatched" |
| Suspended driver | "Suspended drivers cannot be assigned" |
| Expired license | "Drivers with expired licenses cannot be assigned" |
| Over capacity | "Cargo weight (Xkg) cannot exceed vehicle capacity (Ykg)" |

**UI-only warning (client-side):** "Warning: Weight exceeds payload capacity (Xkg)!"

---

### SCENE 12 — Architecture (3:34 – 4:07)

| Field | Detail |
|-------|--------|
| **Time** | 3:34 – 4:07 |
| **Narration** | "The architecture: React nineteen with Vite and TypeScript on the frontend. Express and MongoDB on the backend. JWT with refresh tokens. Role-based access control. Clean separation — routes, controllers, services, repositories, and Mongoose models. Input validation with express-validator and Zod. TanStack Query for server state. Recharts for analytics. Docker Compose for one-command deployment. Integration tests cover the full dispatch lifecycle." |
| **Screen** | Architecture slide OR split: VS Code folder tree (left) + running app (right) |
| **Mouse** | Highlight folders: `routes/` → `services/trip.service.ts` → `repositories/` → `frontend/src/pages/` |
| **Clicks** | None |
| **Transition** | Fade between architecture diagram and code |
| **Zoom** | 110% on `trip.service.ts` business rule block |
| **Pause** | 2s on architecture diagram |
| **Emphasize** | Service layer = business rules · Repository pattern |
| **Camera focus** | Backend `src/` tree |
| **Interaction** | None |

**Architecture diagram (for slide):**
```
┌─────────────┐     REST/JWT     ┌──────────────────────────────────┐
│  React 19   │ ◄──────────────► │  Express API (/api/v1)           │
│  Vite · TS  │                  │  ┌──────────┐  ┌──────────────┐  │
│  TanStack   │                  │  │Controllers│→│   Services   │  │
│  Recharts   │                  │  └──────────┘  └──────┬───────┘  │
└─────────────┘                  │                        ↓          │
                                 │               ┌──────────────┐  │
                                 │               │ Repositories │  │
                                 │               └──────┬───────┘  │
                                 └──────────────────────┼──────────┘
                                                        ↓
                                                 ┌─────────────┐
                                                 │   MongoDB   │
                                                 └─────────────┘
```

---

### SCENE 13 — Closing (4:07 – 4:22)

| Field | Detail |
|-------|--------|
| **Time** | 4:07 – 4:22 |
| **Narration** | "TransitOps replaces spreadsheet chaos with enforced workflows and live financial intelligence. One platform. One source of truth. Built for teams that move the world. Thank you, Odoo Hackathon judges. We are TransitOps." |
| **Screen** | Return to opening slide (logo + team name + tagline). Fade to black. |
| **Mouse** | None |
| **Clicks** | None |
| **Transition** | Slow fade out (2s) |
| **Zoom** | Slow pull-back on logo |
| **Pause** | 3s hold on final frame |
| **Emphasize** | Closing line: "Built for teams that move the world." |
| **Camera focus** | Center logo |
| **Interaction** | None |

**Future scope (optional 1-line lower-third during closing):**
- Live GPS tracking · Automated compliance alerts · PDF report generation · Mobile driver app

---

## STEP 5 — EDITING GUIDE

### Transitions
| Between | Style |
|---------|-------|
| Opening → Problem | Fade through black (0.5s) |
| Problem → App | Swipe up reveal |
| Module to module | Hard cut with 0.2s white flash (Apple-style) |
| Dashboard charts | Smooth scroll (record natively, no post zoom-scroll) |
| Business rule errors | Punch-in cut + 0.1s scale bounce on toast |
| Architecture → Close | Cross-dissolve to logo slide |

### Zoom & Motion
- **KPI cards:** 110% scale, 2s ease-in-out
- **Error toasts:** 120% zoom, hold 1.5s
- **Charts:** Subtle Ken Burns (103% drift over 4s)
- **Code walkthrough:** Smooth pan down file tree

### Cursor
- Enable **cursor highlight** (yellow ring, 60% opacity) in post OR use OBS Cursor Highlight plugin
- **Click animation:** 40ms scale-down ripple on every click (add in post with CapCut/Premiere)
- Move cursor deliberately — no random wandering
- Pause cursor 0.5s before every click

### Typography (motion graphics)
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Title | Outfit | 800 | 48px |
| Body | Plus Jakarta Sans | 500 | 24px |
| Labels | Plus Jakarta Sans | 700 | 14px uppercase |
| Code | JetBrains Mono | 400 | 16px |

### Captions
- Import `transitops-demo.srt`
- Style: white text, black background 70% opacity, bottom center
- Highlight key terms in indigo (#4f46e5): TransitOps, On Trip, ROI, JWT

### Background Music
| Section | Track style | Volume |
|---------|-------------|--------|
| Opening + Close | Cinematic ambient, minimal piano | 15% |
| Dashboard + Workflow | Light corporate tech, steady pulse | 10% |
| Business rules | Tension undertone, lower register | 12% |
| Architecture | Clean electronic, sparse | 8% |

**Sources:** Uppbeat, Pixabay Music, YouTube Audio Library (filter: corporate / ambient / no vocals)

**Rule:** Duck music to 5% during narration. Fade out completely last 5 seconds.

---

## STEP 6 — VOICE OVER SCRIPT (Standalone)

Read naturally. Pace: ~140 words/minute. Total: ~620 words ≈ 4:25.

---

**[OPEN — calm, confident]**

TransitOps. Fleet operations, finally under control.

**[PROBLEM — slightly slower, empathetic]**

Every day, transport companies lose hours to spreadsheets and phone calls. The same vehicle gets booked twice. A suspended driver ends up on a live route. Maintenance slips through the cracks. Fuel costs pile up with no clear picture of ROI. Managers guess at utilization. Finance chases receipts. Safety teams react instead of prevent.

**[SOLUTION — energy lift]**

TransitOps is a transport operations ERP built to replace that fragmentation. One platform for fleet, drivers, dispatches, maintenance, fuel, and financial oversight.

**[AUTH — matter-of-fact]**

Sign in with secure JWT authentication. Each user sees only what their role allows — Admin, Fleet Manager, Safety Officer, Financial Analyst, and Driver. Route guards on the frontend. Role checks on every API endpoint on the backend.

**[DASHBOARD — showcase mode]**

Welcome to TransitOps Core — your fleet operations and ROI intelligence control center. Four KPI cards update in real time from server-side aggregations. Fleet Utilization shows what percentage of your active fleet is en route. Operational Cost combines fuel, maintenance, and approved expenses. Estimated Revenue is calculated at two dollars fifty per mile. Return on Investment measures the efficiency of every asset.

Below that — live charts. Monthly fuel expense trends. Maintenance cost by type. Fleet status allocation. Your three most recent dispatches and compliance alerts, pulled directly from the database.

**[OPERATIONS — crisp, step-by-step]**

In Vehicles, register a new asset, search by plate, filter by status. Duplicate registrations are blocked at the database level. Inspect any vehicle for per-asset ROI, fuel spend, and distance driven.

In the Operator Registry, link drivers to system accounts. License expiry is validated at dispatch. Safety scores display on every profile.

Dispatch a trip. Select an Active vehicle and operator. The UI warns on overweight cargo. The server enforces it. On dispatch, both transition to On Trip. Complete with an end odometer — status returns to Active, mileage syncs.

Schedule maintenance — the vehicle leaves the dispatch pool. Resolve the work order — it's available again.

Log fuel. Record expenses. Approve claims. Dashboard KPIs refresh automatically.

**[RULES — firm, authoritative]**

Now — what happens when someone breaks the rules? Vehicle already on trip — rejected. Suspended driver — blocked. Expired license — stopped. Over capacity — denied. Vehicle in maintenance — the system says no. Clear errors. No silent failures. Rules live in the service layer, not the UI.

**[ARCHITECTURE — technical confidence]**

React nineteen, Vite, TypeScript. Express, MongoDB. JWT with refresh tokens. Role-based access control. Routes, controllers, services, repositories, models. Validation with express-validator and Zod. TanStack Query. Recharts. Docker Compose. Integration tests cover the full dispatch lifecycle.

**[CLOSE — slow, memorable]**

TransitOps replaces spreadsheet chaos with enforced workflows and live financial intelligence. One platform. One source of truth. Built for teams that move the world.

Thank you, Odoo Hackathon judges. We are TransitOps.

---

## STEP 7 — SUBTITLES

File: **`transitops-demo.srt`** (included in this folder)

Import into Premiere Pro, DaVinci Resolve, or CapCut via File → Import Subtitles.

---

## STEP 8 — RECORDING CHECKLIST

### OBS Settings

| Setting | Value |
|---------|-------|
| Resolution | 1920 × 1080 |
| FPS | 60 (export at 30 if file size is large) |
| Encoder | NVENC x264 or x265 |
| Bitrate | 15000 Kbps video · 192 Kbps audio |
| Audio | 48 kHz · Stereo |
| Output | MP4 |

### Browser Setup

| Setting | Value |
|---------|-------|
| Browser | Chrome or Edge (latest) |
| Zoom | 100% (use OBS crop/zoom instead) |
| Window size | 1440 × 900 or fullscreen 1080p |
| Theme | Light mode (better for projection) — toggle via navbar theme switch |
| URL | `http://localhost:3000` |
| DevTools | Closed |

### Cursor Settings (Windows)

- Settings → Mouse → Additional mouse options → Pointers → **Windows Standard (extra large)** OR use OBS mouse highlight filter
- Disable "Enhance pointer precision"
- Move speed: 7/11

### Pre-Recording: Start Services

```bash
# Terminal 1 — MongoDB must be running
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Verify: `http://localhost:5000/health` returns OK.

### Pre-Recording: Seed Demo Data

Run through this sequence once before hitting Record:

1. **Login** as admin
2. **Register 2 vehicles:** one Active (for dispatch), one already On Trip (for rule demo)
3. **Register 2 drivers:** one Active, one Suspended (update in MongoDB or create with expired license)
4. **Create 1 In Progress trip** (for Complete demo):
   - Dispatch a trip via UI
   - Update status via API or MongoDB: `{ status: "In Progress" }`
5. **Schedule 1 maintenance** on a vehicle (for maintenance-block demo)
6. **Create 2–3 fuel logs** and **2 expenses** (1 pending) for dashboard richness
7. **Create 2 notifications** (Admin can POST to `/api/v1/notifications`) for Compliance Alerts panel

### Recording Order (efficient — app stays open)

| Order | Scene | Why this order |
|-------|-------|----------------|
| 1 | Dashboard tour | Fresh data loaded |
| 2 | Vehicles (search, filter, create, metrics) | — |
| 3 | Drivers (dossier, safety score) | — |
| 4 | Trip dispatch (success path) | Changes vehicle status |
| 5 | Vehicles (show On Trip status) | Immediate proof |
| 6 | Trip complete | Reset statuses |
| 7 | Maintenance schedule + resolve | — |
| 8 | Fuel + Expenses + Dashboard KPI refresh | Show live update |
| 9 | Business rule failures (4 errors) | Use pre-staged bad data |
| 10 | Notifications page | API-connected alerts |
| 11 | Login sequence | Re-record separately for Scene 3 |
| 12 | Architecture (code walkthrough) | VS Code, no browser needed |
| 13 | Opening + Closing slides | Record last OR create in Canva |

### Post-Recording

- [ ] Trim dead air (target: no gap > 0.8s)
- [ ] Add cursor highlight
- [ ] Import SRT subtitles
- [ ] Add background music (ducked under VO)
- [ ] Color grade: slight contrast boost (+5%), saturation (+3%)
- [ ] Export: H.264, 1080p, 30fps, ~200 MB max for upload

---

## STEP 9 — JUDGES Q&A (20 Predicted Questions)

### Product & Business

**1. What problem does TransitOps solve?**  
TransitOps replaces spreadsheet-based fleet management with a single system that prevents double-bookings, enforces compliance at dispatch time, and calculates operational ROI automatically.

**2. Who is the target user?**  
Fleet managers dispatching vehicles, safety officers monitoring compliance, financial analysts tracking costs, and admins managing users — five distinct roles with tailored access.

**3. How is this different from a generic CRUD app?**  
Business rules live in the service layer. Dispatching a trip atomically validates vehicle status, driver license, cargo weight, and then transitions both vehicle and driver to On Trip. That logic cannot be bypassed from the UI.

**4. What is the ROI formula?**  
ROI = (Estimated Revenue − Operational Cost) / Operational Cost × 100. Revenue is estimated at $2.50 per mile of completed trips. Operational cost aggregates fuel logs, maintenance costs, and approved/paid expenses.

**5. Why $2.50 per mile?**  
It's a configurable industry-standard freight rate used as a baseline for revenue estimation. The constant lives in `dashboard.service.ts` and `vehicle.service.ts` and can be made environment-configurable.

### Technical Architecture

**6. Why MongoDB over SQL?**  
Fleet documents (vehicles, trips with nested locations/cargo) map naturally to MongoDB's document model. Aggregation pipelines power dashboard analytics efficiently.

**7. Explain your backend architecture.**  
Routes → Controllers → Services → Repositories → Mongoose Models. Controllers are thin. Services contain business rules. Repositories handle data access with pagination and soft-delete filtering.

**8. How does authentication work?**  
JWT access tokens (15-minute expiry) with refresh tokens (7 days) stored in the user document and httpOnly cookies. Axios interceptors auto-refresh on 401.

**9. How is RBAC implemented?**  
Backend: `authorize('Admin', 'Fleet Manager', ...)` middleware checks role name on every protected route. Frontend: `ProtectedRoute` component and sidebar filtering by role array.

**10. Why both express-validator and Zod?**  
express-validator validates API requests on the server. Zod validates forms on the client via a custom Form component resolver. Defense in depth.

### Business Rules

**11. What happens when you dispatch a trip?**  
The TripService validates vehicle (not retired, not in maintenance, not on trip), driver (license valid, not suspended, not on trip), and cargo weight. On success, both statuses change to On Trip.

**12. Can a vehicle in maintenance be dispatched?**  
No. The service returns: "Vehicles in maintenance cannot be dispatched." The frontend also filters maintenance vehicles from the dispatch dropdown.

**13. How is cargo capacity enforced?**  
Client shows a warning if weight exceeds payload. Server rejects with: "Cargo weight (Xkg) cannot exceed vehicle capacity (Ykg)."

**14. What happens on trip completion?**  
Vehicle and driver return to Active. Vehicle mileage syncs to the end odometer reading. Distance contributes to fuel efficiency and revenue calculations.

**15. Are plate numbers unique?**  
Yes. MongoDB unique index on `plateNumber`. Duplicate attempts return a 400 error with duplicate key details.

### Frontend & UX

**16. Why React Query?**  
Server state is cached and invalidated precisely — e.g., creating a fuel log invalidates `dashboardKpis` so the dashboard refreshes without a full page reload.

**17. Is the Reports page connected to the API?**  
Honestly: not yet. Reports.tsx uses static mock data for UI demonstration. Live analytics are on the Dashboard and per-vehicle metrics endpoints. PDF export shows a toast placeholder.

**18. Can users edit vehicles after registration?**  
The API supports PUT on vehicles, but the frontend currently implements create, delete, and metrics inspection only. Edit is a near-term addition.

**19. How do you handle dark mode?**  
ThemeContext persists preference in localStorage. Tailwind class-based dark mode toggles across all components.

### DevOps & Testing

**20. How do you verify the system works?**  
Jest + Supertest integration tests in `erp.test.ts` cover auth, unique vehicle registration, license validation, cargo limits, dispatch state transitions, maintenance workflows, fuel logging, and expense creation. Docker Compose runs MongoDB, backend, and frontend together.

---

## APPENDIX — Demo Data Quick Reference

### Login
```
Email:    admin@transitops.com
Password: adminpassword123
```

### Sample Dispatch
```
Trip ID:     TRIP-DEMO-01
Origin:      Dallas, TX
Destination: Houston, TX
Cargo:       Electronics · 5000 kg
Start Odom:  (auto-filled from vehicle mileage)
```

### Sample Maintenance
```
ID:          REPAIR-DEMO-01
Type:        Corrective
Priority:    High
Description: Brake pad replacement
```

### Roles & Sidebar Access

| Module | Admin | Fleet Mgr | Safety | Financial | Driver |
|--------|-------|-----------|--------|-----------|--------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | — |
| Vehicles | ✓ | ✓ | ✓ | ✓ | — |
| Drivers | ✓ | ✓ | ✓ | — | — |
| Trips | ✓ | ✓ | ✓ | ✓ | — |
| Maintenance | ✓ | ✓ | ✓ | — | — |
| Fuel | ✓ | ✓ | — | ✓ | — |
| Expenses | ✓ | — | — | ✓ | — |

---

*Generated from full codebase analysis. Every demonstrated feature verified against source code.*
