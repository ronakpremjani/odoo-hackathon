# TransitOps - Transport Operations ERP

TransitOps is a production-ready, full-stack Transport Operations Enterprise Resource Planning (ERP) platform built for fleet management, driver assignment, cargo dispatch tracking, and financial operations.

---

## 1. Project Architecture

The codebase is split into two decoupled packages structured to follow clean code standards (SOLID):

```
odoo-hackathon/
│
├── backend/                  # Node.js + Express.js API
│   ├── src/
│   │   ├── models/           # Mongoose schemas (Enums, validations, soft delete)
│   │   ├── repositories/     # Base & concrete repositories (Data access layer)
│   │   ├── services/         # Business logic layer (State transitions & ROI formulas)
│   │   ├── controllers/      # Lean endpoints (HTTP mappings)
│   │   ├── middleware/       # Auth guards, RBAC check, validation filter, errors
│   │   └── routes/           # REST endpoints definition
│   └── .env                  # Port, Database URI, Secrets
│
└── frontend/                 # React 19 + Vite + TypeScript Client
    ├── src/
    │   ├── api/              # Axios interceptors & TanStack Query configuration
    │   ├── components/       # Reusable UI controls, tables, modals, route guards
    │   ├── context/          # Toast notify, Theme context, Auth providers
    │   ├── hooks/            # Search debounce custom hooks
    │   ├── pages/            # Lazy loaded operational views
    │   └── routes/           # Lazy route mapping definitions
```

---

## 2. Implemented Business Rules

The platform enforces all core operational constraints inside the service layer (avoiding domain leak into controllers):
* **Vehicle Constraints**:
  * Registration plate number must be unique.
  * Retired or In Maintenance vehicles cannot be dispatched.
  * Vehicle already assigned to another active trip cannot be dispatched.
* **Driver Constraints**:
  * Suspended drivers cannot be assigned to trips.
  * Drivers with expired licenses cannot be assigned to trips.
  * Driver already en route on another active trip cannot be assigned.
* **Cargo Constraints**:
  * Cargo weight cannot exceed the maximum payload capacity of the assigned vehicle.
* **Dispatched State Machine**:
  * Dispatching a trip changes Vehicle and Driver statuses from `Available` ➔ `On Trip`.
  * Completing a trip sets statuses back to `Available` and syncs final odometer readings to vehicle mileage.
  * Cancelling a trip sets statuses back to `Available`.
  * Scheduling Maintenance changes Vehicle status to `In Maintenance` (In Shop).
  * Closing Maintenance sets Vehicle status back to `Available`.

---

## 3. Operational Calculations & ROI Formulas

All operations metrics are calculated automatically on the server:
* **Fuel Cost**: Cost sum of logged refueling sheets.
* **Operational Cost**: Aggregation of expenses + fuel logs + maintenance repair invoices.
* **Fuel Efficiency**: Total distance driven divided by total fuel quantity filled.
* **Fleet Utilization**: Count of `On Trip` vehicles divided by total active (non-retired) vehicles.
* **Vehicle ROI**: Estimating freight revenue at a standard rate of `$2.50` per mile of completed trips:
  $$\text{ROI} = \frac{\text{Est. Revenue} - \text{Operational Cost}}{\text{Operational Cost}}$$

---

## 4. Performance & Security Optimizations

* **Code Splitting (Lazy Loading)**: Client-side routing loads pages lazily using `lazy` & `Suspense` containers, loading chunks dynamically to speed up initialization.
* **Role Route Guards**: Protects sensitive views (e.g. Expenses, Maintenance) from unauthorized URL navigation using a custom `<ProtectedRoute />` wrapper checking AuthContext roles.
* **Lean Queries**: Applied Mongoose `.lean()` to list query pipelines in repositories, bypassing document hydration for faster rendering.
* **Input Search Debouncing**: Implemented a `useDebounce` hook to optimize input searches by reducing rendering triggers.

---

## 5. Getting Started

### Prerequisites
* **Node.js**: v18.0+
* **MongoDB**: Local or cloud instance

### Setup Env Files
Ensure `.env` files are configured at `backend/.env` and `frontend/.env`.

1. **Backend Environment** (`backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/transitops
   JWT_SECRET=super_secret_jwt_access_token_key_12345
   JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_12345
   ```

2. **Frontend Environment** (`frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api/v1
   ```

### Execution

1. **Start Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend Client**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Compile & Build Production
To verify compiling and build assets:
* **Backend**: `npm run build`
* **Frontend**: `npm run build`