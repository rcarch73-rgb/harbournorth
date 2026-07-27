Harbour North 4.0 RC2.3 — Tax Strategy Engine Fix

Corrected issue:
- Four strategy cards were being assigned display labels that the projection engine did not recognize.
- The engine therefore silently treated them as the same Balanced strategy, producing identical results.

Correct strategy mappings now used:
- Balanced withdrawals -> balanced
- RRSP-first -> RRSP/RRIF drawdown
- TFSA-first -> custom TFSA-first account order
- Early RRSP drawdown -> tax-bracket optimized drawdown
- Delay CPP to 70 -> CPP start age 70

The active plan remains unchanged while comparisons run on cloned plans.

Harbour North 4.0 RC2.2 — iPad Layout Fix

Changes:
- Keeps the Harbour North logo fixed and fully visible while the navigation list scrolls.
- Adds iPad/iPhone safe-area spacing.
- Resets each page to the top immediately when navigating.
- Prevents tax and other page content from reopening beneath the sticky header.
- No retirement calculations or saved-plan data were changed.

Harbour North 4.0 RC2.1 — Branding & Contrast Fix

Fixes:
- Embeds the Harbour North wordmark directly in index.html so it cannot break on GitHub Pages.
- Repairs low-contrast greeting and status text in the Retirement Snapshot.
- Adds an embedded browser favicon.
- Preserves the RC2 retirement engine and stored-data compatibility.

GitHub Pages upload:
Upload index.html. The included image and manifest files may also be uploaded for PWA support, but the visible sidebar logo no longer depends on them.

After replacing the file, hard-refresh Safari or clear the site cache so the previous page is not reused.
