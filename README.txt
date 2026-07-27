Harbour North 4.0 RC2 — Strategy & Tax Audit

Changes
-------
- Strategy-page ending estate now uses the same today's-dollar calculation as Results.
- Ending portfolio is also shown in today's dollars.
- Lifetime tax is shown in today's dollars for fair comparison across a multi-decade horizon.
- Nominal lifetime tax, federal tax, provincial tax, taxable income and effective tax rate remain visible in expandable audits.
- Each strategy audit shows total RRSP/RRIF, TFSA and non-registered withdrawals.
- Each strategy audit shows ending RRSP/RRIF and TFSA balances.
- Highest-tax year and amount are shown.
- Corrected a separate lowest-portfolio bug: Math.min included a literal zero, forcing the result to display $0.

Tax calculation review
----------------------
The projection recalculates household tax after taxable RRSP/RRIF withdrawals are added to each owner's taxable income.
TFSA withdrawals are excluded from taxable income. Higher lifetime tax under RRSP/RRIF drawdown can therefore be legitimate
when the strategy accelerates registered withdrawals. The new audit panel exposes the withdrawal and taxable-income totals
needed to confirm whether that result is reasonable for the current plan.

No tax brackets, federal/provincial rates, investment returns or withdrawal-order rules were changed.
