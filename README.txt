Harbour North 4.0 RC2 Final — Both Partners Welcome

Change:
- The Overview welcome now includes the first names of both partners when two people are entered.
- Example: “Good afternoon, Ryan and Sarah.”
- The avatar displays both initials.
- Single-person plans continue to show only one name.

No calculations, plan data, tax logic, or backup behavior were changed.

Harbour North 4.0 RC2 Final

Final RC2 additions:
- Plan Protection status on the Overview page.
- Tracks the date of the last exported backup.
- Tracks whether the saved plan has changed since that backup.
- Prompts before closing, refreshing or navigating away when a backup is recommended.
- Warns before importing over an unprotected plan.
- Strengthens the reset warning when changes are not backed up.
- Backup Now immediately updates the protection indicator.

Browser note:
Modern browsers intentionally show their own standard wording for close/refresh warnings. Harbour North controls when that warning appears, but cannot customize the browser's text.

No retirement calculations, tax logic or saved-plan schema were changed.

Harbour North 4.0 RC2.4 — Overview Personalization and Controls

Changes:
- Corrected font colour on dark navy primary buttons for reliable white text.
- Added Backup, Import and Reset controls directly to the Overview page.
- Added a personal welcome panel using the primary household member's first name.
- Added the current weekday and date using Canadian formatting.
- Overview controls reuse the existing protected backup/import/reset workflows.
- No retirement calculations, tax logic or saved-plan schema were changed.

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
