# TaskFlow Application Architecture

## Overview

This repository is a JavaScript monorepo with two primary application components:

- **API (`packages/api`)**: Express-based backend exposing REST endpoints under `/api`.
- **Client (`packages/client`)**: React + Vite frontend for login, dashboard, and task views.

It also includes a utility script package for security benchmarking:

- **Security Compare (`scripts/security-compare`)**: Node.js tooling that compares Snyk findings with GitHub Advanced Security (CodeQL + Dependabot) results.

## High-Level Structure

```text
Client (React/Vite)
  └─ HTTP (JSON)
      └─ API (Express)
          ├─ Routes
          ├─ Controllers
          ├─ Services
          ├─ Repositories
          └─ PostgreSQL (via Sequelize)
```

## Backend Layering

The API follows a layered structure:

1. **Routes** define endpoints and map requests.
2. **Controllers** handle request/response concerns.
3. **Services** implement business logic.
4. **Repositories** manage data access through Sequelize models.
5. **Database config/models** provide persistence setup and schema mappings.

## Frontend Structure

The client application uses:

- `AuthProvider` context for authentication state.
- React Router for public (`/login`) and protected routes (`/dashboard`, `/projects/:id/tasks`).
- Axios-based API calls to the backend.

## Security Benchmarking Component

The `scripts/security-compare` package:

1. Parses Snyk CSV exports.
2. Fetches CodeQL and Dependabot findings via GitHub APIs.
3. Matches findings across tools.
4. Produces JSON, HTML, and markdown summary reports.
