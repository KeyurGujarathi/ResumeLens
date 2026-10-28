# ResumeLens — Lavender Horizon Edition

This edition applies the Lavender Horizon design system across the existing app: a light lavender canvas, white content surfaces, violet and soft-blue accents, refined borders and shadows, improved form contrast, responsive landing sections, and reduced-motion support.

## Run locally

See the project-root `README.md` for complete frontend and backend setup steps.

## Main changes

- `frontend/src/index.css`: shared light theme, reusable utility color overrides, responsive landing styles, consistent cards/forms, and reduced-motion support.
- `frontend/index.html`: updated page title and browser theme color.
- `backend/requirements.txt`: backend dependencies for a fresh Python environment.
- `README.md`: project setup and validation notes.

## Validation performed in the packaging environment

- Backend imports successfully.
- FastAPI smoke checks returned HTTP 200 for `/`, `/docs`, `/api/companies`, and `/api/skills/rankings`.
- SQLite `PRAGMA quick_check` returned `ok`; the database contains 5,004 job-posting records.
- CSS brace count is balanced.
- A frontend production build could not be run here because the npm registry was unreachable; install dependencies and run `npm run build` locally.

These checks are useful smoke checks, not a claim that every user workflow has been production-certified.
