# breadsheet-ui - Claude Context

## Project Overview

React front end for **Breadsheet** — a scheduling tool for long, multi-step recipes (sourdough, pizza, etc.). Helps home cooks visualize step start/finish times and adjust windows to fit their schedule. Front end only; communicates with the `breadsheet` Python/Flask backend via REST API.

- **Live site:** https://breadsheet.com
- **Deployment:** Google Cloud Storage bucket

## Tech Stack

Versions as of the Nov 2026 dependency upgrade ([Second Rise](https://github.com/brystmar/breadsheet/blob/main/docs/second-rise-feature.md) backlog item 1b).

| Area | Package | Version |
|---|---|---|
| Runtime | Node (pinned in `.nvmrc`) | 26 LTS; `engines` allows `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |
| Package manager | npm | 11 (ships with Node 26) |
| Framework | react, react-dom | 19.3 |
| Routing | react-router (v8 dropped the separate `react-router-dom` package) | 8.5 |
| Date/time | moment | 2.31 |
| Date picker | react-datepicker | 9.1 |
| Misc | uuid, react-copy-to-clipboard | 14.0, 5.1 |
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

- Dev mode reads `.env.development` (backend at `http://127.0.0.1:5000`); build, preview, and tests read `.env` (production backend)
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
The source of truth is `../breadsheet/docs/second-rise-feature.md`, in the sibling checkout. Read it before planning or executing any Second Rise work. Never copy it into this repo; if it needs changes, say so and stop.

## Notes for Claude

- The style guide at `coding-style-guide.md` is authoritative — follow it exactly
- Do not add semicolons to SASS; do not convert to CSS modules or styled-components
- Prefer editing existing components over introducing new abstractions
- All new components must follow the naming-prefix table and folder-grouping rules
- `moment` is the date/time library in use — do not introduce `date-fns` or `dayjs` (react-datepicker pulls in `date-fns` internally; don't import it directly)
- Look up current package versions rather than assuming; `npm outdated` hides releases whose `engines` exclude the active Node version
