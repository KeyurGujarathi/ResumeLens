# ResumeLens — final project handoff

ResumeLens is a React + Vite career-guidance and resume toolkit backed by FastAPI and SQLite. It includes resume building, resume analysis, career profile, skill-gap guidance, company fit, career roadmap, placement preparation, skills exploration, account registration/login, per-account saved-data sync, and admin analytics.

## Local setup (Windows PowerShell)

### 1. Backend
```powershell
cd .\backend
# If this project already has a working .venv, activate it; otherwise create one:
# py -m venv .venv
# .\.venv\Scripts\Activate.ps1
# pip install -r requirements.txt
$env:RESUMELENS_ADMIN_EMAIL="your_registered_email@example.com"
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
Use the email address of the account you want to designate as the administrator. Admin access is checked by the backend on every admin API request. Keep this environment variable private.

### 2. Frontend (second terminal)
```powershell
cd .\frontend
npm install
npm run dev -- --host 0.0.0.0
```
Open the local URL Vite prints, usually `http://localhost:5173`.

### 3. Test on a phone on the same Wi-Fi
1. Find your computer's local IPv4 address using `ipconfig` (for example, `192.168.1.25`).
2. Allow Python/Node through Windows Firewall on your **private network** if prompted.
3. On the phone, open `http://192.168.1.25:5173` using your computer's actual IP.
4. The backend needs to be running with `--host 0.0.0.0`. The frontend resolves the API using the same LAN hostname on port 8000.

Local-network testing is for development only. Do not expose this setup directly to the public internet.

## Production deployment

- Deploy the frontend and FastAPI backend over HTTPS.
- Configure `VITE_API_BASE_URL` before building the frontend if the API uses a separate public domain, e.g. `https://api.example.com` (no trailing slash).
- Set `RESUMELENS_ALLOWED_ORIGINS` on the backend to a comma-separated list of exact frontend origins, e.g. `https://resumelens.example.com`.
- Set `RESUMELENS_ADMIN_EMAIL` to the intended administrator's registered email.
- Use persistent disk storage for `backend/resumelens.db` or migrate to a managed database. Do not deploy on an ephemeral filesystem if you need data to survive restarts.
- Do not commit `.env` files, credentials, `.venv`, `node_modules`, or private database backups to a public repository.
- Configure HTTPS, backups, rate limiting, monitoring, and an appropriate privacy/retention policy before accepting real users.

## Mobile installation (PWA)

The frontend includes a web app manifest, icons, and a service worker for an installable app shell. Installability generally requires HTTPS (except localhost). On Android, use the browser's Install app/Add to Home screen option. On iPhone, use Share → Add to Home Screen. ResumeLens still needs an internet connection for account login, server-saved data, resume analysis, and other backend features; private/API responses are intentionally not cached offline.

## Validation notes

The backend smoke tests cover registration, login, server-side data save/read, activity logging, admin overview, admin user data, and denial of admin access to a normal account. Run `npm run build` in `frontend` before publishing. Browser-by-browser visual QA and a real phone check must still be completed on the target device; no code change can honestly guarantee identical rendering on every screen/browser.
