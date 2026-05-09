# CuraVet Local Rebuild — Execution Continuation Plan

## Current Goal
We are rebuilding the existing CuraVet web application inside a new clean local project structure while:

- Keeping the same frontend UI imported from Figma
- Using the old project as a reference only
- Running everything locally first
- Preserving the original module plan and architecture
- Fixing the navigation, routing, API, and structural issues from the old codebase
- Preparing the project for cleaner deployment later on Vercel + Render + MongoDB Atlas

---

# Existing Architecture (Confirmed)

## Frontend
- React + Vite
- Zustand for auth state
- Tailwind UI
- Imported Figma design
- Port: 5173

## Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io
- Port: 5001

## Database
- MongoDB Local
- Database Name:

```env
CuraVet_Local
```

---

# Problems Identified in Old Project

## Critical Issues

### 1. Hardcoded Case Feed
The donor home feed is not connected to MongoDB.

Current issue:

```txt
GET /api/cases
```
returns only mock data instead of real database cases.

Impact:
- Donor feed is fake
- Real cases never appear
- Funding system becomes unreliable

Fix:
Reconnect route to:

```js
getCases controller
```

---

### 2. Broken Navigation Routes
Several routes point to pages that do not exist.

Examples:

| Broken Route | Correct Route |
|---|---|
| /donor/dashboard | /donor/home |
| /login/vet | /login/donor |

Impact:
- White screens
- Blank pages
- Navigation crashes

---

### 3. Socket.io Event Mismatch
Frontend listens for:

```txt
donationUpdate
```

Backend emits:

```txt
donation_received
```

Impact:
- Real-time donations do not update

Fix:
Use one unified event name everywhere.

Recommended:

```txt
donation_received
```

---

### 4. Edit Case Page Is Fake
Current EditCase.tsx only renders CreateCase.

Missing:
- Existing data preload
- PATCH API integration
- Ownership checks
- Form persistence

---

### 5. Recovery Feed Uses Mock Data
Recovery feed is not connected to backend.

Needed:

```txt
GET /api/recovery/all
```

---

### 6. Cloudinary Dependency Breaks Local Development
Photo uploads fail if Cloudinary is not configured.

Solution for local build:
- Add local uploads fallback
- Store images temporarily in:

```txt
backend/uploads/
```

Later:
- Re-enable Cloudinary for deployment

---

# Clean Rebuild Structure

## New Recommended Structure

```txt
Projects/
└── CuraVet/
    ├── frontend/
    │   ├── src/
    │   ├── public/
    │   ├── components/
    │   ├── pages/
    │   ├── routes/
    │   ├── store/
    │   ├── services/
    │   └── layouts/
    │
    ├── backend/
    │   ├── controllers/
    │   ├── middleware/
    │   ├── models/
    │   ├── routes/
    │   ├── config/
    │   ├── uploads/
    │   ├── socket/
    │   └── utils/
    │
    ├── docs/
    ├── .gitignore
    ├── README.md
    └── package.json
```

---

# Immediate Rebuild Priorities

## Phase 1 — Foundation

### Backend

Build first:

- Express server
- MongoDB connection
- JWT auth
- Role middleware
- Case routes
- Donation routes
- Recovery routes
- Admin routes

Use:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/CuraVet_Local
```

---

### Frontend

Move ONLY reusable parts from old project:

Keep:
- UI components
- Tailwind styles
- Layouts
- Icons
- Theme
- Page designs

Do NOT copy:
- Broken routing
- Old API logic
- Mock data
- Hardcoded navigation
- Old Zustand auth logic without cleanup

---

# Recommended Frontend Route Structure

## Public

```txt
/
/login/donor
/signup/donor
/signup/vet
/case/:id
/recovery
```

## Donor

```txt
/donor/home
/donor/profile
/donor/donations
```

## Vet

```txt
/vet/dashboard
/vet/create-case
/vet/edit-case/:id
/vet/recovery-upload/:id
/vet/profile
```

## Admin

```txt
/admin/dashboard
/admin/cases
/admin/vets
/admin/stats
```

---

# Backend API Standardization

## Auth

```txt
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PATCH  /api/auth/change-password
POST   /api/auth/forgot-password
```

---

## Cases

```txt
GET    /api/cases
GET    /api/cases/:id
GET    /api/cases/my
POST   /api/cases
PATCH  /api/cases/:id
DELETE /api/cases/:id
```

---

## Donations

```txt
POST   /api/donations
GET    /api/donations/my
GET    /api/donations/case/:id
```

---

## Recovery

```txt
GET    /api/recovery/all
GET    /api/recovery/case/:id
POST   /api/recovery
```

---

## Admin

```txt
GET    /api/admin/vets/pending
PATCH  /api/admin/vets/:id/approve
PATCH  /api/admin/vets/:id/reject
GET    /api/admin/cases
PATCH  /api/admin/cases/:id/approve
DELETE /api/admin/cases/:id
GET    /api/admin/stats
```

---

# Local Development Rules

## Rule 1 — No Mock Data in Production Components
Mock data must stay isolated.

Never hardcode:

```js
const cases = [ ... ]
```

inside real pages.

---

## Rule 2 — All Navigation Must Use React Router
Never use:

```js
window.location
```

Use:

```js
useNavigate()
```

---

## Rule 3 — Centralized API Layer
Create:

```txt
src/services/api.js
```

All API calls must go through it.

---

## Rule 4 — Shared Auth Store
Single Zustand store only.

Do not duplicate:
- token state
- role state
- login methods

---

## Rule 5 — Safe Rendering
Always use fallback rendering.

Example:

```js
config?.status?.bg || 'gray'
```

This prevents white-screen crashes.

---

# Recommended Rebuild Order

## Stage 1

- Initialize backend
- Connect MongoDB
- Build auth system
- Seed test users

---

## Stage 2

- Build donor feed
- Build case detail page
- Connect real cases API

---

## Stage 3

- Build donation flow
- Add Socket.io real-time updates
- Auto-close cases when funded

---

## Stage 4

- Build vet dashboard
- Case creation
- Recovery uploads

---

## Stage 5

- Build admin panel
- Vet approvals
- Case approvals
- Stats

---

## Stage 6

- Local upload system
- Replace mock data everywhere
- Error handling
- Loading states
- Toast notifications

---

## Stage 7

Deployment preparation:

- Cloudinary
- MongoDB Atlas
- Render backend
- Vercel frontend
- Environment separation

---

# Immediate Next Step

The next implementation step should be:

## Create the clean local project skeleton

Then:

1. Copy ONLY reusable frontend UI
2. Rebuild routing from scratch
3. Reconnect backend properly
4. Remove all hardcoded stubs
5. Fix Socket.io naming
6. Build clean API layer

This avoids carrying old architectural problems into the new rebuild.

---

# Important Conclusion

The old CuraVet project is NOT fundamentally broken.

Most issues come from:

- placeholder code
- mock data
- unfinished routing
- mismatched endpoints
- temporary development shortcuts

The architecture itself is strong:

- modular backend
- role-based access
- scalable API design
- proper separation of concerns
- real-time support
- future AI integration capability

So instead of patching the old structure repeatedly, rebuilding cleanly while reusing the stable UI is the correct long-term decision.

