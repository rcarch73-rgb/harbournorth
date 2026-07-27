Harbour North 4.0 RC2 Calculation Audit

Root cause corrected
--------------------
The Tax page was reading r.ages[0], but projection rows store ages in r.people[0].age.
Because the age was therefore blank, the app could not find the age-71 row and silently
used the final year of the entire planning horizon instead.

The card then displayed endingInvestments, which is the total portfolio across registered,
TFSA, non-registered and cash accounts. It was mislabeled as RRIF-related.

Corrections
-----------
- Finds the actual projection row where the primary person first reaches age 71.
- Sums only RRSP/RRIF account balances for that row.
- Excludes TFSA, non-registered and cash balances.
- Adds an expandable account-by-account audit below the RRIF Outlook card.
- Corrects the warning and retirement report labels.
- Shows “Unavailable” rather than silently using the final planning year if the horizon
  does not reach age 71.

No withdrawal, tax, growth, contribution or retirement funding calculations were changed.
This build corrects the selection and presentation of the age-71 registered-account metric.
