---
title: "RSI — The Momentum Thermometer Every Trader Needs"
description: "Learn how the Relative Strength Index (RSI) works, how to read overbought and oversold zones, and how to use RSI divergences to spot reversals — with Indian market examples."
tags: ["trading", "learn-trading"]
pubDate: 2026-03-03
publish: true
---

**Series: Learn Trading — Day 5 of 24**

You've learned about trends, moving averages, and volume. Today we add one of the most popular momentum indicators to your toolkit — the **Relative Strength Index**, or RSI.

## What Is RSI?

RSI is a momentum oscillator that measures the speed and magnitude of recent price changes. It gives you a number between 0 and 100.

- **Above 70** → generally considered **overbought** (price may have run up too fast)
- **Below 30** → generally considered **oversold** (price may have fallen too fast)

That's the one-liner. But there's more nuance to it, and that's what separates beginners from traders who actually use RSI well.

## How Is It Calculated?

RSI was developed by J. Welles Wilder in 1978. The default period is **14** (meaning it looks at the last 14 candles).

The formula boils down to:

```
RSI = 100 - (100 / (1 + RS))
```

Where **RS** = Average Gain over 14 periods / Average Loss over 14 periods.

You don't need to calculate this by hand — every charting platform on Sahi or TradingView does it for you. But understanding the logic helps: RSI is essentially comparing how much price went up vs. how much it went down, recently.

## Reading RSI: Beyond Overbought and Oversold

Here's where most beginners go wrong. They see RSI hit 70 and immediately think "time to sell!" or see it drop below 30 and think "time to buy!"

**That's not how it works.**

### 1. Overbought Doesn't Mean "Sell Now"

During a strong uptrend, RSI can stay above 70 for weeks. Think of Reliance during a major rally — RSI might hover between 65-85 for an extended period. Selling just because RSI crossed 70 would have you exiting way too early.

**The rule:** In a strong trend, overbought/oversold levels shift. In uptrends, look at 40-80 as the range. In downtrends, 20-60.

### 2. Oversold Doesn't Mean "Buy Now"

Same logic in reverse. If Nifty is in a sharp correction, RSI can stay below 30 for days. Buying at the first touch of 30 during a crash is how people catch falling knives.

### 3. The Centerline Matters

The 50 level is often overlooked but incredibly useful:

- RSI crossing **above 50** suggests bullish momentum is building
- RSI crossing **below 50** suggests bearish momentum is taking over

In trending markets, the 50 line acts as support (in uptrends) or resistance (in downtrends). Next time you're watching TCS or Infosys on a daily chart, notice how RSI bounces off 50 during a healthy uptrend.

## RSI Divergence — The Real Power Move

This is where RSI gets genuinely useful for spotting reversals.

### Bullish Divergence

- **Price** makes a **lower low**
- **RSI** makes a **higher low**

Translation: price is falling, but momentum is weakening. The sellers are losing steam. This often precedes a reversal to the upside.

**Example:** Imagine Nifty drops from 22,000 to 21,500 (first low), bounces, then drops again to 21,300 (lower low). But RSI at the first drop was 25, and at the second drop it's 32. That's bullish divergence — momentum didn't confirm the new low.

### Bearish Divergence

- **Price** makes a **higher high**
- **RSI** makes a **lower high**

Translation: price is climbing but with decreasing momentum. The rally is running out of fuel.

**Example:** A banking stock like HDFC Bank makes a new high at ₹1,750 with RSI at 78, then pulls back, then rallies again to ₹1,780 — but RSI only reaches 72. Bearish divergence. The buying pressure is fading even as price inches higher.

### Important Caveat

Divergence is a **warning signal**, not an automatic trade trigger. It tells you momentum is shifting, but you still need confirmation — a trendline break, a candlestick reversal pattern, or a moving average crossover to actually act on it.

## Practical RSI Settings

The default 14-period RSI works well for most situations, but you can adjust:

- **RSI(7)** — more sensitive, more signals, more noise. Good for intraday on 15-min charts.
- **RSI(14)** — the standard. Works great on daily and 4-hour charts.
- **RSI(21)** — smoother, fewer signals, more reliable. Good for swing trades on daily/weekly charts.

If you're just starting out, stick with 14. Change it later when you have a reason to.

## RSI in the Indian Market Context

A few things specific to trading on NSE:

- **Nifty RSI on the weekly chart** is a solid gauge of overall market health. When weekly RSI drops below 40, historically those have been decent accumulation zones (not a guarantee — just a tendency).
- **Bank Nifty** tends to have more volatile RSI swings because of the sector's sensitivity to RBI policy decisions.
- **During earnings season**, individual stock RSI can get wild. Don't rely on RSI alone when a stock is about to report numbers — fundamentals override technicals at those moments.
- On Sahi, you can overlay RSI directly on your charts. If you haven't already, add it to your default indicator set.

## Common Mistakes

1. **Trading RSI in isolation.** RSI is one tool. Combine it with trend analysis (Day 2), moving averages (Day 3), and volume (Day 4) for better results.

2. **Ignoring the trend.** RSI overbought in an uptrend is not the same as RSI overbought in a range-bound market. Context matters.

3. **Chasing divergences on tiny timeframes.** A divergence on a 1-minute chart means almost nothing. Look for divergences on 1-hour, 4-hour, or daily charts for meaningful signals.

4. **Using RSI as a standalone system.** No single indicator is a complete trading system. Ever.

## Quick Recap

| Concept | What It Tells You |
|---|---|
| RSI > 70 | Momentum is high — watch for exhaustion, don't blindly sell |
| RSI < 30 | Momentum is low — watch for reversal, don't blindly buy |
| RSI crossing 50 | Momentum shifting direction |
| Bullish divergence | Price falling but momentum improving — potential reversal up |
| Bearish divergence | Price rising but momentum fading — potential reversal down |

## What's Next

Tomorrow we tackle **MACD** — another momentum indicator that pairs beautifully with RSI. Where RSI tells you *how fast* price is moving, MACD helps you see *when* momentum is actually changing direction. Together, they're a solid combo.

See you on Day 6.

---

*This is Day 5 of a 24-day series on trading. Start from [Day 1: Trading Foundations](/posts/trading-foundations) if you're just joining.*
