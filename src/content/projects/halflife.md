---
title: "Halflife"
subtitle: "How fast news is priced into a stock, and whether anything is left to trade"
summary: "An event study of every 8-K filed by an S&P 500 company over six weeks of the Q3 2026 earnings season, measured at 2-minute resolution on a trading clock that includes pre- and post-market hours. It finds the regular open, not after-hours trading, is where earnings news is priced; tests whether the rest of a move can be predicted, and stress-tests what seemed to work, finding no established edge; and keeps a live, hash-chained record of predictions made before their outcomes exist."
cover: "/covers/halflife.svg"
tech: ["Python", "pandas", "SciPy", "scikit-learn", "SEC EDGAR", "Event studies", "Walk-forward evaluation", "matplotlib"]
featured: true
order: 1.56
github: "https://github.com/sushantlokhande14/halflife"
---

## Problem

"The market prices in news quickly" is said a lot and measured rarely, because it needs three things pinned down at once: when the news became public, to the second; what counts as time when the market sleeps half the day; and where the price ended up. Without them, any half-life is a guess. And a strategy that trades on what is left of a move needs more than a backtest that looks good: it needs a record that cannot be edited after the outcome is known.

## Approach

- **Precisely timed news.** SEC 8-K filings, whose acceptance times are recorded to the second, for all 500 companies of the S&P 500, one share class each, merged into 882 events.
- **A trading clock.** Prices on a 2-minute grid over 04:00 to 20:00 Eastern, on which nights and weekends take no time, built so that no point on it can see a later trade.
- **A measured threshold.** Each move is scaled by the stock's own trailing volatility, and 1,497 random moments with no filing set the false-positive rate, so half-lives are only read from events that actually moved the stock.
- **Two decision points, walk-forward.** Ten minutes after the filing, and right after the regular open. Each week is predicted only from outcomes known before it began; features come from a view of the path that physically stops at the decision; every trade pays a cost, and every return is tested per trade and per trading day.
- **A live record.** A runner watches the SEC's search index every 20 seconds, records each prediction before its outcome exists, scores it after the close, and chains every entry to the one before by hash.

## Result

- **Most filings are not news.** Earnings releases moved their stock at least two daily standard deviations 46% of the time; executive changes 3% and routine filings 6%, about the 5% of random moments.
- **The open does the work.** For earnings released after the close, a median 6% of the move is in after an hour of after-hours trading and 37% by the next open, and the open's first two minutes add another 23%. Half the move arrives around 8 the next morning (median 464 trading minutes). For releases before the open, half arrives after 89 minutes.
- **First reactions mislead.** Trading in the direction of the move four minutes after an earnings filing lost 63 bps on average before costs.
- **No edge, honestly.** Going with the opening move earned +45.9 bps per trade out of sample (t = 2.60), but with each trading day counted once, t was 0.19: two busy weeks. Gradient boosting held up better, positive in all four test weeks and at t of 2 or more in 11 of 18 nearby settings, but at a per-day t of 1.53 it is a candidate, not an edge. Both are fixed in a pre-registered policy and scored live.
- **Checked by 43 tests**, including recovery of known half-lives from synthetic paths, proof that two opposite futures give identical features, and a ledger that catches edits, deletions and reordering.
