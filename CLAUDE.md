# CLAUDE.md — breadsheet-ui

## Project Overview

React front end for **Breadsheet** — a scheduling tool for long, multi-step recipes (sourdough, pizza, etc.). Helps home cooks visualize step start/finish times and adjust windows to fit their schedule. Front end only; communicates with the `breadsheet` Python/Flask backend via REST API.

- **Live site:** http://breadsheet.com
- **Deployment:** Portainer stack on Intel NUC 13i5 LXC (local) or Google Cloud Storage bucket (public)

## Tech Stack

- **Framework:** React 17 (JavaScript, ES6+)
- **Styling:** SASS (indented syntax)
- **UI library:** MDBReact (Material Design for Bootstrap React)
- **Date/time:** moment + moment-timezone, react-datepicker, react-moment
- **Routing:** react-router-dom v5
- **Misc:** loglevel + loglevel-plugin-remote, react-copy-to-clipboard, uuid, prop-types
- **Testing:** @testing-library/react, @testing-library/jest-dom
- **Build:** react-scripts (Create React App)
- **Package manager:** npm

## Local Development

```bash
npm install       # Install dependencies
npm start         # Dev server at http://localhost:3000
npm run build     # Production build → /build
npm test          # Run test suite
```

## Project Structure

```
public/           # Static assets, index.html, favicon
src/
  components/     # React components (grouped in subfolders when 3+ are related)
  scripts/        # Vanilla JS utilities, logically grouped by purpose
  styles/         # SASS files (.sass, indented syntax)
coding-style-guide.md   # Authoritative style reference — read before editing
```

## Code Style

The full style guide lives at `coding-style-guide.md` in the repo root. Key rules are summarized here.

### JavaScript / React

- **ES6+ syntax** always (arrow functions, template literals, destructuring)
- **Double quotes** for all strings
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
- Vanilla JS utilities → `src/scripts/`, grouped by purpose

### SASS

- **Indented syntax** — no braces, no semicolons
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

- Build with `npm run build`, then serve the `/build` folder from a container or GCS bucket
- API base URL configured via `REACT_APP_API_URL` environment variable
- Portainer manages the Docker container on the local NUC; rebuild the image after each production build

## Notes for Claude

- The style guide at `coding-style-guide.md` is authoritative — follow it exactly
- Do not add semicolons to SASS; do not convert to CSS modules or styled-components
- Prefer editing existing components over introducing new abstractions
- All new components must follow the naming-prefix table and folder-grouping rules
- `moment` is the date/time library in use — do not introduce `date-fns` or `dayjs`
