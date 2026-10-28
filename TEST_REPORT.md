# ResumeLens validation report

## Checks that passed in the packaging environment

- Python source compilation (`python -m compileall -q backend`).
- Backend smoke tests using isolated temporary SQLite databases:
  - registration and duplicate-email rejection;
  - invalid-password rejection and login;
  - server-side user-data create/read/delete;
  - activity-event recording;
  - normal-user denial for admin APIs;
  - configured-admin access to overview and saved user data;
  - server-side session revocation on logout.
- Existing bundled SQLite database migration check on a copy:
  - `user_data` and `activity_events` tables are created by SQLAlchemy startup;
  - existing counts were preserved: 15 companies, 5,004 job postings, 63 skills, and 1 user.
- Existing database-backed read endpoints returned successful responses for the backend root, skill rankings, skill counts, company list, and Python skill trends.
- JavaScript syntax checks passed for the shared API URL helper, storage helper, Vite config, and service worker.
- PWA manifest parsed as valid JSON.

## Checks that could not be completed here

- The frontend production build (`npm run build`) could not be run because the npm registry was unreachable in this environment (`EAI_AGAIN`); dependencies were not re-downloaded.
- A real browser/device visual regression pass was not possible in this environment. Mobile layouts have responsive CSS and the PWA assets are present, but the final UI must still be opened on the target desktop and phone to verify rendering, navigation, file uploads, and all user journeys.

Do not interpret this report as a claim that every pixel or every browser has been certified. Run `npm install` and `npm run build` on the target Windows machine, then exercise the app with both servers running before public deployment.
