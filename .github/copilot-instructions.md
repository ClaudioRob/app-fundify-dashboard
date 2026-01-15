# Financial App Dashboard - AI Agent Instructions

## Project Overview
Modern financial dashboard with React + TypeScript frontend and Node.js/Express backend. Uses **JSON file persistence** (no database) for transactions and account plan data.

## Architecture

### Monorepo Structure
- **Root**: Workspace with `npm run dev` (uses `concurrently` to start both services)
- **Backend** (`backend/`): Express.js REST API on port 3001
- **Frontend** (`frontend/`): React + Vite on port 5173
- **Data** (`backend/data/`): Auto-created JSON files for persistence

### Data Flow
```
Frontend (React) ↔ REST API ↔ Backend Memory ↔ JSON Files
                              (sync on every change)
```

## Critical Patterns

### 1. Transaction Structure Duality
The `Transaction` interface has **two sets of fields** for compatibility:

```typescript
interface Transaction {
  // Standard fields (frontend compatibility)
  id, date, description, amount, type, category, status
  
  // Excel import fields (plan de contas integration)
  Id_Item, Natureza, Tipo, Categoria, SubCategoria, 
  Operação, OrigemDestino, Item, Data, Valor
}
```

**Key relationship**: `transaction.Id_Item` links to `accountPlan.ID_Conta`

### 2. Persistence Mechanism
**NEVER use database commands**. All data is stored in JSON files:
- Changes are **immediately persisted** using `saveTransactions()` / `saveAccountPlan()`
- Backend loads data from files on startup via `loadTransactions()` / `loadAccountPlan()`
- See [backend/src/index.ts](backend/src/index.ts#L30-L90) for persistence functions

### 3. UTF-8 String Normalization
All user input strings MUST go through `normalizeString()`:
```typescript
description: normalizeString(req.body.description)
```
This prevents encoding issues with Portuguese characters (ç, ã, é, etc.).

### 4. Account Plan Cascade Updates
When updating an account in the plan ([docs/ACCOUNT_PLAN_UPDATE.md](docs/ACCOUNT_PLAN_UPDATE.md)):
- `PUT /api/account-plan/:id` automatically updates all related transactions
- Uses `updateTransactionsByAccountId()` to sync changes
- Bulk sync available via `POST /api/transactions/sync-with-account-plan`

### 5. Status Auto-Calculation
Transactions have status: `P` (Previsto), `R` (Realizado), `N` (Não Realizado)
- Status is **auto-calculated** based on transaction date vs today
- Future dates → `P`, past dates → `R`
- Function: `getAutoStatus()` in both backend and AdminDashboard component

### 6. Operational Filter Pattern
Financial calculations **exclude** transactions with `Natureza === 'Operacional'`:
```typescript
const filteredTransactions = transactions.filter(t => t.Natureza !== 'Operacional')
```
Applied in `calculateBalance()` and `calculateCharts()` functions.

## Developer Workflows

### Start Development
```bash
npm run install:all  # Install all dependencies
npm run dev          # Start backend + frontend concurrently
```

### Component-Specific Development
```bash
npm run dev:backend    # Backend only (port 3001)
npm run dev:frontend   # Frontend only (port 5173)
```

### Testing Persistence
```bash
./test-persistence.sh  # Verify JSON file persistence works
```

## API Conventions

### Endpoint Ordering
**CRITICAL**: Specific routes MUST come before parameterized routes:
```typescript
// ✅ CORRECT order in index.ts
app.delete('/api/transactions/all', ...)      // Specific first
app.delete('/api/transactions/:id', ...)      // Parameterized after
```

### Data Import Endpoints
- `POST /api/account-plan/import` - Replace entire account plan
- `POST /api/transactions/import` - Add transactions (validate against plan if enabled)
- Imports **do NOT trigger cascade updates** (by design)

### ID Handling
IDs can be **numbers OR strings**. Always use string comparison:
```typescript
const id = isNaN(Number(idParam)) ? idParam : parseInt(idParam)
const index = transactions.findIndex(t => String(t.id) === String(id))
```

## Frontend Patterns

### Component Structure
- **App.tsx**: Main router with 3 modes (dashboard, admin, cashflow)
- **AdminDashboard.tsx**: Data management with inline editing tables
- **CashFlowPage.tsx**: Monthly/yearly filtered transaction view
- All use `services/api.ts` for backend communication

### State Management
- No global state library - useState + props only
- Data fetching pattern: `loadData()` after mutations
- Toast notifications via `Toast.tsx` component

### Filtering Pattern
Filters use combo box for column selection + text input:
```typescript
const [filterColumn, setFilterColumn] = useState<string>('')
const [filterValue, setFilterValue] = useState<string>('')
```

## Common Gotchas

1. **Don't create database schemas** - This project uses JSON files only
2. **Port 3001, not 3000** - Backend runs on 3001 (check [backend/src/index.ts](backend/src/index.ts#L6))
3. **Always normalize strings** - Use `normalizeString()` for all text input
4. **Map storage for accountPlan** - Backend uses `Map<number|string, AccountPlan>` not array
5. **Frontend API URL** - Hardcoded to `http://localhost:3001/api` in [api.ts](frontend/src/services/api.ts#L3)

## Key Files Reference

- [backend/src/index.ts](backend/src/index.ts) - All backend logic in single file (REST API + persistence)
- [docs/TECHNICAL.md](docs/TECHNICAL.md) - Detailed persistence architecture
- [docs/ACCOUNT_PLAN_UPDATE.md](docs/ACCOUNT_PLAN_UPDATE.md) - Cascade update feature explanation
- [frontend/src/services/api.ts](frontend/src/services/api.ts) - API client with all endpoints
- [frontend/src/components/AdminDashboard.tsx](frontend/src/components/AdminDashboard.tsx) - Complex data management UI

## Testing Notes
- No automated tests currently in project
- Manual testing via `test-persistence.sh` script
- Test imports using Excel files with Brazilian Portuguese data
