# CuraVet Local Rebuild

This project is a clean local-first rebuild of the CuraVet web application.

## Goals

- Local-first development with React + Vite frontend and Node.js + Express backend.
- Preserve original architecture while fixing routing, API integration, and data flow.
- Keep the project modular, maintainable, and traceable with per-project history.

## Local ports

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

## Structure

- `frontend/` - React + Vite application
- `backend/` - Node / Express API server
- `HISTORY.log` - project-specific action audit

## Getting started

1. Install dependencies in both `frontend/` and `backend/`.
2. Run the backend on port `5001`.
3. Run the frontend on port `5173`.

## Notes

- This repository is built from the clean rebuild plan.
- The `Reference/` folder is strictly for reference and should not be used as source code.
