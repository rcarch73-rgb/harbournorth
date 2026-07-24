# Harbour North 0.3.0 — Timeline Engine

This is the first modular retirement-engine build.

## Project structure

- `index.html` — page structure
- `css/app.css` — visual design
- `js/app.js` — application, storage, forms, dashboard
- `js/timeline-engine.js` — pure year-by-year timeline calculations
- `tests/timeline-engine.test.js` — automated timeline tests

## Run locally

Use a small web server from the project folder. Opening `index.html` directly may work, but a web server matches GitHub Pages more closely.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Test

```bash
npm test
```

## GitHub Pages

Upload the **contents** of this folder to the repository root. Keep the folder structure intact. GitHub Pages should deploy from `main` and `/(root)`.

## Scope

The Timeline Engine currently:

- produces one row per year;
- calculates household ages;
- marks working/retired status;
- attaches retirement, income-start/end, and one-time milestones;
- exports the timeline to CSV.

It intentionally does not yet calculate income totals, taxes, investment growth, spending, or withdrawals.
