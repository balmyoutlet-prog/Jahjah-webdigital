# Public evidence sources

Every third-party statistic shown on the public site (`src/lib/site-data.ts` → `evidenceItems`) was checked against its primary source before being added. If any of these numbers ever need updating or re-verifying, start here — do not edit `evidenceItems` from memory.

| Claim shown | Exact figure | Primary source | Verified |
| --- | --- | --- | --- |
| Speed changes what people do next | 53% of mobile visits abandoned after a 3s+ load | Google, "The Need for Mobile Speed" (2016) — https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/ | 2026-08-24 |
| Small speed gains, measurable movement | +8.4% retail conversions / +9.2% AOV per 0.1s mobile speed gain | Deloitte, commissioned by Google, "Milliseconds Make Millions" (2020) — https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html | 2026-08-24 |
| Search is where trust starts in this region | 77% of UAE/KSA consumers use Google Search as first touchpoint | Google × Kantar, "The Emotional Value of Search" (UAE & KSA, n=4,000, 2022) — https://business.google.com/en-all/think/consumer-insights/consumer-behavior-emotional-buying-mena/ | 2026-08-24 |

## Rules for adding a new one
1. Fetch the primary source page directly (not a secondary blog quoting it) and copy the exact figure and methodology.
2. Preserve the nuance of the original claim — an observed correlation in a study is not a guarantee for any individual business. Never rewrite "X% increase observed in this study" as "your sales will increase X%."
3. Add the row here with today's verification date, then add the matching entry to `evidenceItems` in `src/lib/site-data.ts`.
4. Never publish a number without both a source name and a working source URL.
