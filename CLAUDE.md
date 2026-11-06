# breadsheet-ui - Claude Context

## Project Overview

React front end for **Breadsheet** — a scheduling tool for long, multi-step recipes (sourdough, pizza, etc.). Helps home cooks visualize step start/finish times and adjust windows to fit their schedule. Front end only; communicates with the `breadsheet` Python/Flask backend via REST API.

- **Live site:** https://breadsheet.com
- **Deployment:** Google Cloud Storage bucket

## Tech Stack

Versions as of the Nov 2026 dependency upgrade ([Second Rise](https://github.com/brystmar/breadsheet/blob/main/docs/second-rise.md) backlog item 1b).

| Area | Package | Version |
|---|---|---|
| Runtime | Node (pinned in `.nvmrc`) | 26 LTS; `engines` allows `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |
| Package manager | npm | 11 (ships with Node 26) |
| Framework | react, react-dom | 19.3 |
| Routing | react-router (v8 dropped the separate `react-router-dom` package) | 8.5 |
| Date/time | moment | 2.31 |
| Date picker | react-datepicker | 9.1 |
| Misc | react-copy-to-clipboard | 5.1 |
| Build | vite, @vitejs/plugin-react | 8.3 (Rolldown + Oxc), 6.2 |
| Styling | sass (indented syntax, `@use` modules) | 1.107 |
| Testing | vitest, jsdom, @testing-library/react, /dom, /jest-dom, /user-event | 5.1, 30.1, 16.3, 10.4, 7.0, 14.6 |

- `package.json` sets `"type": "module"`; every JS file is ESM
- Import routing APIs (`BrowserRouter`, `Routes`, `Route`, `Link`, `useParams`, `MemoryRouter`) from `"react-router"`, not `"react-router-dom"`
- react-datepicker's `selected` prop must be a `Date`, not epoch milliseconds

## Local Development

```bash
nvm use           # Switch to the Node version in .nvmrc (26)
npm install       # Install dependencies
npm start         # Dev server at http://localhost:3000 (via Vite)
npm run build     # Production build → /dist
npm run preview   # Serve the production build locally
npm test          # Run test suite (Vitest, watch mode; `npx vitest run` for a single pass)
```

- Dev mode reads `.env.development` (backend at `http://localhost:5050`: run the backend with `BOUND_PORT=5050`, since macOS AirPlay holds 5000); build and preview read `.env` (production backend). Tests use a placeholder backend set in `vite.config.js`, since they mock `fetch`
- Use `localhost`, not `127.0.0.1`, for both the UI and the backend: browsers treat them as different sites, so the session cookie wouldn't be sent
- CI (`.github/workflows/tests.yml`) runs `npm ci`, `npx vitest run` and `npm run build` on Node from `.nvmrc` for every PR and push to `main`. Dependabot (`.github/dependabot.yml`) opens monthly grouped npm and GitHub Actions updates, waiting 7 days after a release; when merging one, update the version table above
- npm 11 skips install scripts for `fsevents` and `@parcel/watcher` and warns about it; both are optional and the build doesn't need them

## Project Structure

```
index.html        # Vite entry point (loads src/index.jsx)
public/           # Static assets copied as-is: favicons, manifest, icons
src/
  components/     # React components (grouped in subfolders when 3+ are related)
  data/           # Default values and API endpoint definitions
  helpers/        # Vanilla JS utilities, logically grouped by purpose
  hooks/          # Custom React hooks
  styles/         # SASS files (.sass, indented syntax)
coding-style-guide.md   # Authoritative style reference — read before editing
```

## Code Style

The full style guide lives at `coding-style-guide.md` in the repo root. Key rules are summarized here.

### JavaScript / React

- **ES6+ syntax** always (arrow functions, template literals, destructuring)
- **Double quotes** for all strings
- **No semicolons** unless required in new code (older files still have them; don't reformat unrelated lines)
- **Functional components** — no class-based components
- **Self-closing JSX tags** wherever possible
- Separate business logic from UI; separate functional blocks with a blank line
- Add a comment above each new functional block

#### JSX Props

```jsx
// 2 or fewer short props → inline
<button className="btn" onClick={handleSave}>

// 3+ props → one per line; first prop stays inline; closing /> on last-prop line
<select className="input picklist"
        name="difficulty"
        value={recipe.difficulty}
        onChange={handleChange}
        required={true}>
```

#### Component Naming

- PascalCase, no punctuation
- Verb-first when a verb is present: `ConvertText.js`, `BtnAddStep.js`
- HTML-element prefixes:

| HTML Element | Prefix |
|---|---|
| `<header>` | `Header` |
| `<nav>` | `Nav` |
| `<footer>` | `Footer` |
| `<button>` | `Btn` |
| `<form>` | `Form` |
| `<label>` | `Label` |
| `<select>` | `Picklist` |
| `<textarea>` | `Txt` |
| `<input type="text">` | `Txt` |
| `<input type="number">` | `Num` |

- 3+ logically related components → group in a subfolder under `src/components/`
- Vanilla JS utilities → `src/helpers/`, grouped by purpose

### SASS

- A form's main action uses `btn btn-primary`, which shares the old New Recipe button's (`btn-add`) colors and hover/active rules in `buttons.sass`. Don't use `btn-submit` for new screens: it's the older dark style.

- **Indented syntax** — no braces, no semicolons
- Components import the `.sass` files directly and Vite compiles them; don't create or commit compiled `.css` files in `src/styles/` (they're gitignored)
- Variables at the top, in order: **Fonts → Color palette → Layout defaults**
- Variable names: lowercase, hyphen-separated, operative word first (`$color-primary`, not `$primary-color`)
- Hex codes: lowercase
- Section headers: triple-asterisk comment, two blank lines before, one blank line after

```sass
/*** Buttons ***/

.btn
  height: 2.5em
  width: 7em
```

- Multiple selectors: one per line
- Children nested under their parent, no blank lines between parent and children

## Deployment Notes

- Build with `npm run build`, then serve the `/dist` folder from a container or GCS bucket
- `deploy.sh` builds and syncs `/dist` to the `www.breadsheet.com` GCS bucket (hashed assets cached forever, everything else no-cache)
- API base URL configured via `VITE_BACKEND_URL` environment variable (see `.env` / `.env.development`)
- Portainer manages the Docker container on the local NUC; rebuild the image after each production build
- The host's Node version only affects local builds; Docker images pin their own Node base image

## Second Rise spec
The source of truth is `../breadsheet/docs/second-rise.md`, in the sibling checkout. Read it before planning or executing any Second Rise work. Never copy it into this repo; if it needs changes, say so and stop.

### Milestone feature toggle
Second Rise work ships to production hidden, then a milestone is released by changing a default rather than by merging a branch (spec: Decisions, Release).
- The footer's "Features: M1 · M2" control (`FooterFeatureLevel`) sets this browser's level, saved in `localStorage`. `m1` is today's app and the default.
- Levels and the default live in `src/helpers/feature_levels.js`. `FeatureLevelProvider` (in `src/hooks/useFeatureLevel.jsx`) wraps the app in `src/index.jsx`; tests that render `App` must wrap it too.
- Switching the toggle back to the default level returns to the homepage, since the current page may not exist there.
- Gate every new milestone screen, route, and control: `<AtFeatureLevel min="m2">…</AtFeatureLevel>`, or `useFeatureLevel().atLeast("m2")` in logic. At `m1`, the app must behave exactly as before.
- Key-link sign-in (`/k`) must work at any level: a link opened on a new device starts at the default.
- Releasing a milestone: set `DEFAULT_LEVEL` to it and drop levels nobody should pick anymore (a saved level that no longer exists falls back to the default). Rolling back: set the default back.

### Identity (M2)
Key-based sign-in against `/api/v2/users` and `/api/v2/session` (backend: breadsheet#26).
- Screens in `src/components/identity/`: `/register` (a live username checklist, then the one-time save-your-key screen), `/signin` (paste a key), `/k` (key link), `/devices`, and `NavAccount` in the header ("Register | Sign in"). All gated at M2 except `/k`.

**Recipes are read-only** (breadsheet-ui#45): the backend's v1 recipe writes are off, so the UI has
no add, edit, delete or Save controls. Start/finish times and step waits still change on the page,
for planning, but aren't saved. Defaults are managed with the backend's admin key; personal
recipe editing arrives with the M2 recipe screens (breadsheet-ui#31).
- Usernames: 3 to 30 characters, only letters, numbers, `_` and `-`, starting with a letter (`usernameChecks()` in `src/helpers/identity.js` mirrors the server).
- `src/data/session_api.js` makes the calls and returns `{ ok, data }` or `{ ok: false, code, message, retryAfter }`; `useSession()` (`SessionProvider` in `src/index.jsx`) holds the signed-in user and only calls the API at M2.
- Key links are `/k#<key>`: the key is in the fragment, which never reaches a server. `KeyLink` removes it from the address bar and history before signing in, then turns on M2 for that browser.
- **The key is the user's only credential.** Keep it in component state only: never `localStorage`/`sessionStorage`, a URL path or query, the console, or analytics. GoatCounter skips `/k` (the `path` callback in `index.html` and the route counter in `App.jsx`).
- The session cookie is `HttpOnly`, so the UI can't see it; ask `useSession()` instead.

## Notes for Claude

- The style guide at `coding-style-guide.md` is authoritative — follow it exactly
- Do not add semicolons to SASS; do not convert to CSS modules or styled-components
- Prefer editing existing components over introducing new abstractions
- All new components must follow the naming-prefix table and folder-grouping rules
- `moment` is the date/time library in use — do not introduce `date-fns` or `dayjs` (react-datepicker pulls in `date-fns` internally; don't import it directly)
- Look up current package versions rather than assuming; `npm outdated` hides releases whose `engines` exclude the active Node version
