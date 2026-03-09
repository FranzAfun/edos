---
description: Repository Information Overview
alwaysApply: true
---

# EDOS (ERA Digital Operating System) Information

## Summary
EDOS is a comprehensive digital operating system designed for the ERA organization. It features a React-based frontend with a sophisticated role-based access control (RBAC) system, governance pipelines, and modules for KPI management, budget control, and organizational oversight. Currently, the project is in a **frontend-only state**, utilizing `localStorage` for all data persistence and mock services for API interactions.

## Structure
- **src/components**: Reusable UI components and domain-specific elements.
- **src/context**: React contexts for feature flags, permissions, and global state.
- **src/governance**: Core logic for role mapping, permission constants, and approval stages.
- **src/hooks**: Custom hooks for permissions, governance enforcement, and module data.
- **src/layouts**: Role-specific dashboard layouts (CEO, Admin, Finance, etc.).
- **src/modules**: Feature-specific pages and logic (KPIs, Approvals, Budgets, Assets).
- **src/pages**: Route entry points for the application.
- **src/shared/services**: `localStorage`-backed data stores (the current "mock" persistence layer).
- **src/services**: `httpClient.js` wrapper for future API integration.

## Language & Runtime
**Language**: JavaScript (React 19)  
**Version**: Node.js (Vite 7)  
**Build System**: Vite  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `react`, `react-dom` (v19)
- `react-router-dom` (v7)
- `recharts` (Charts & Graphs)
- `date-fns` (Date manipulation)
- `jspdf`, `jspdf-autotable`, `xlsx` (Reporting & Exports)

## Build & Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Frontend Implementation Details
### 1. Role-Based Access Control (RBAC)
- **6 Roles**: `executive`, `dept_head`, `finance`, `operations`, `ceo`, `admin`.
- **34 Permissions**: Granular access control constants (e.g., `VIEW_TREASURY`, `ADMIN_MANAGE_USERS`).
- **Authority Levels**: Tiered system (0 for Admin, up to 5 for CEO) used for workflow enforcement.

### 2. Governance & Approvals
- **8 Governance Stages**: `WORK`, `EVIDENCE`, `SCORING`, `AUTHORITY_REVIEW`, `APPROVAL`, `SPENDING`, `VERIFICATION`, `INSIGHT`.
- **Approval Workflow**: 4-stage pipeline (`PENDING_FO` → `PENDING_OPERATIONS` → `PENDING_CEO` → `APPROVED`).
- **Compliance Enforcement**: Funding-blocked and evidence-pending badges integrated into approval queues.

### 3. Functional Modules (localStorage backed)
- **KPI System**: Task creation, evidence submission, and impact-weighted scoring (1x, 2x, 4x).
- **Budget Module**: Departmental limits, freezing/unfreezing logic, and availability warnings.
- **User Registry**: Full CRUD with authority and role mapping.
- **Notification System**: Live local subscription with unread counts and filtering.

## Backend & Database (Yet to be built)
**Status**: **NOT IMPLEMENTED**
**Current Implementation**: 
- All data resides in `localStorage` via `*Store.js` files in `src/shared/services/`.
- `httpClient.js` returns hardcoded mock success responses.

**Migration Requirements**:
- **Runtime**: Recommended Node.js (Express/Fastify) or Python (Django/FastAPI).
- **Database**: MySQL (Targeting Laragon's local environment).
- **Authentication**: JWT or Session-based auth.
- **API Design**: RESTful endpoints to replace current store functions.
