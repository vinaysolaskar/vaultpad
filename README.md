# Vaultpad

Vaultpad is a secure, private personal notes vault.

Notes are private by default and strictly owned by the authenticated user.
All authorization is enforced at the database level using Supabase Row Level Security (RLS).

---

## Tech Stack

**Frontend**
- React + Vite
- Tailwind CSS
- Supabase JavaScript Client

**Backend (BaaS)**
- Supabase Authentication
- PostgreSQL
- Row Level Security (RLS)

**Deployment**
- Netlify

---

## Core Principles

- No custom backend server
- No frontend-only security
- No shared or public notes
- Ownership enforced via `auth.uid() = user_id`
- Calm, distraction-free UI

---

## Security Model (High Level)

- Each note row contains a `user_id` column
- Row Level Security (RLS) policies restrict:
  - SELECT, INSERT, UPDATE, DELETE
- Users can only access rows where:
  `auth.uid() = user_id`
- Frontend filtering is never trusted for authorization

---

## Setup & Usage

Setup instructions and deployment details will be added after initial implementation.

---