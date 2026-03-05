---
title: "Bollinger Bands — Reading Volatility Like a Pro"
description: "Learn how Bollinger Bands measure volatility, spot squeezes, and help you time entries. Practical examples with Nifty and Indian stocks."
tags: ["trading", "learn-trading"]
pubDate: 2026-03-05
publish: true
---

**Series: Learn Trading — Day 7 of 24**

We've covered moving averages, volume, RSI, and MACD. Today we're adding another essential tool to your chart: **Bollinger Bands**. If the previous indicators helped you understand trend and momentum, Bollinger Bands help you understand *volatility* — how wildly a stock is moving.

And volatility, as you'll learn, is where the real opportunities hide.

## What Are Bollinger Bands?

Created by John Bollinger in the 1980s, Bollinger Bands are three lines plotted on a price chart:

1. **Middle Band** — A 20-period Simple Moving Average (SMA). You already know this from Day 3.
2. **Upper Band** — Middle Band + (2 × standard deviation)
3. **Lower Band** — Middle Band − (2 × standard deviation)

That's it. The middle line is your average price, and the upper and lower bands create an *envelope* around it based on how much the price has been fluctuating.

When the stock is calm, the bands contract. When it's volatile, they expand. Think of them as breathing — the bands inhale (squeeze) and exhale (expand) with the market's energy.

## Why Standard Deviation?

Standard deviation measures how spread out prices are from the average. In practical terms:

- **High standard deviation** = prices are jumping around a lot = wide bands
- **Low standard deviation** = prices are barely moving = narrow bands

Statistically, about 95% of price action stays within 2 standard deviations of the mean. That's why the default setting uses 2× — most price movement gets captured inside the bands.

When price moves *outside* the bands, something unusual is happening. That's your signal to pay attention.

## Reading Bollinger Bands on a Chart

Open any chart on Sahi and add Bollinger Bands (usually under "Indicators" → search "Bollinger"). You'll immediately notice a few things:

### The Squeeze

This is the most powerful Bollinger Band signal. When the bands contract tightly — almost pinching together — it means volatility has dried up. The stock is coiling like a spring.

**Low volatility doesn't last forever.** A squeeze almost always precedes a big move. The catch? It doesn't tell you *which direction*.

Take Nifty in late 2024 — there were several periods where the index traded in a tight 200-point range for days. The Bollinger Bands narrowed dramatically. Then boom — a 500+ point move in a single session.

Your job during a squeeze: *get ready*. Watch for the breakout direction, then act.

### The Walk

Sometimes, during a strong trend, price will "walk the band" — repeatedly touching or riding along the upper band (in an uptrend) or lower band (in a downtrend).

This is *not* a reversal signal. It's a sign of strength.

When Reliance rallied from ₹2,400 to ₹2,800 in mid-2024, it spent weeks walking the upper Bollinger Band. Traders who sold because "price is at the upper band" got burned. The trend was strong, and the bands were expanding — that's a continuation, not an exhaustion.

**Key rule:** Walking the band + expanding bands = trend continuation. Don't fight it.

### The Reversal (Mean Reversion)

In a *range-bound* market — where there's no clear trend — Bollinger Bands work beautifully as mean-reversion signals:

- Price touches the **upper band** → likely to pull back toward the middle
- Price touches the **lower band** → likely to bounce toward the middle

This works because in sideways markets, prices tend to oscillate around the average. The bands essentially mark the extremes of that oscillation.

**Important:** This only works in ranges. In a trending market, trying to fade touches of the band will destroy your capital. Always check the trend first (use your moving averages from Day 3 or MACD from Day 6).

## Practical Strategies

### 1. Squeeze Breakout

1. Identify a squeeze — bands are at their narrowest in the last 6 months
2. Wait for price to close *outside* one of the bands
3. Enter in the direction of the breakout
4. Use the opposite band or the middle band as your stop-loss zone

Example: TCS trades between ₹3,800 and ₹4,000 for three weeks. Bands are super tight. Then a strong earnings report drops and price closes at ₹4,100, outside the upper band. You go long, with a stop near ₹3,900 (the middle band).

### 2. Bollinger Bounce (Range Markets Only)

1. Confirm the market is range-bound (ADX below 25, or visually flat)
2. Buy near the lower band
3. Sell near the upper band
4. Keep the middle band as your initial target

This is a bread-and-butter strategy for Bank Nifty when it chops sideways during expiry weeks.

### 3. Bollinger + RSI Combo

This is where things get interesting. Combine Bollinger Bands with RSI (Day 5):

- Price at the **lower band** + RSI below 30 = strong oversold signal
- Price at the **upper band** + RSI above 70 = strong overbought signal

Using two independent indicators together increases your confidence. If Bollinger says oversold *and* RSI says oversold, the odds of a bounce improve significantly.

## Common Mistakes

**Treating band touches as automatic buy/sell signals.** The bands are not support and resistance. They're volatility envelopes. Context matters — are you in a trend or a range?

**Ignoring the middle band.** Many traders fixate on the upper and lower bands and forget the SMA in the middle. The middle band is a great dynamic support/resistance level and a useful target for mean-reversion trades.

**Using Bollinger Bands alone.** Like every indicator, Bollinger Bands work best in combination. Pair them with RSI, MACD, or volume analysis for stronger signals.

**Not adjusting for timeframe.** The default 20-period, 2-standard-deviation setting works well on daily charts. On shorter timeframes (15-min, 5-min), you might want to tweak — some intraday traders use 12-period bands. Experiment on Sahi's paper trading before going live.

## Settings and Variations

The standard settings (20, 2) work for most situations. But you can adjust:

- **Shorter period (10)** — more sensitive, more signals, more noise
- **Longer period (50)** — smoother, fewer signals, higher quality
- **1.5 standard deviations** — tighter bands, more frequent touches
- **2.5 standard deviations** — wider bands, only extreme moves break out

Start with the defaults. Only change them after you understand why you're changing them.

## Quick Recap

| Concept | What It Tells You |
|---|---|
| Squeeze (narrow bands) | Big move coming — direction unknown |
| Expanding bands | Volatility increasing, trend in motion |
| Walking the band | Strong trend, don't fade it |
| Touch in a range | Mean reversion likely |
| Bollinger + RSI | High-confidence overbought/oversold |

## What's Next

Tomorrow — **Chart Patterns Part 1**. We'll move from indicators to pure price action: Head & Shoulders, Double Tops, Double Bottoms. These patterns have been used for over a century because they work. See you on Day 8.

*Previous: [Day 6 — MACD](/posts/trading/macd) · Next: Day 8 — Chart Patterns Part 1*
