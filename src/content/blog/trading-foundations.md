---
title: "Trading Foundations: How Markets Actually Work"
description: "Day 1 of 30: Everything you need to know before placing your first trade — order books, candlesticks, support/resistance, and more."
tags: ["trading", "learn-trading", "markets"]
pubDate: 2026-02-27
publish: true
---

> **Series: Learn Trading** — This is Day 1 of a 30-day series where we go from zero to confident trader. No fluff, no "trust me bro" advice. Just how things actually work.

---

You've opened Zerodha. You see green numbers, red numbers, candles that look like modern art, and an order form that asks if you want "market" or "limit." You close the app.

Sound familiar? Let's fix that today. By the end of this post, you'll understand what's actually happening when you hit that buy button — and more importantly, *why prices move the way they do.*

## How Stock Markets Actually Work

Think of the stock market like a massive, highly optimized matchmaking system. Not Tinder — more like a distributed message queue where buy orders and sell orders get paired up.

India has two major exchanges:

- **NSE (National Stock Exchange)** — Where most of the action happens. Nifty 50 lives here.
- **BSE (Bombay Stock Exchange)** — The OG, established in 1875. Home of the Sensex.

Both are regulated by SEBI (Securities and Exchange Board of India), which is basically the adult in the room making sure nobody cheats.

### The Order Book & Matching Engine

Here's the part most people never think about. When you place a buy order for Reliance at ₹2,500, your order doesn't magically find a seller. It goes into something called the **order book** — a real-time ledger of all pending buy and sell orders for that stock.

The exchange runs a **matching engine** that pairs buyers with sellers. Think of it like a priority queue (yes, the data structure):

1. **Price priority** — The highest buy order gets matched first. The lowest sell order gets matched first.
2. **Time priority** — If two orders have the same price, whoever placed theirs first wins.

NSE's matching engine processes orders in **microseconds**. It's one of the fastest systems in the world. If you're a developer, imagine a high-throughput event processor doing millions of order matches per second during market hours (9:15 AM to 3:30 PM IST).

When a buy order's price meets a sell order's price — *trade executed*. That's it. That's a transaction. The price you see on your screen? It's just the price of the **last matched trade**.

## Types of Market Participants

Not everyone in the market is the same. Understanding who's playing — and how much money they're moving — changes how you interpret price action.

### Retail Traders (That's You and Me)

Individual investors trading with their own money through brokers like Zerodha, Groww, or Angel One. We're the small fish. Retail traders account for roughly 35-45% of NSE's daily turnover, which sounds like a lot until you realize...

### Institutional Investors

These are the whales:

- **FIIs (Foreign Institutional Investors)** — Think Goldman Sachs, Morgan Stanley, foreign pension funds. When FIIs dump Indian stocks, Nifty drops. When they buy, it rallies. Their flows are *that* significant. SEBI tracks and publishes FII data daily — smart traders watch this religiously.

- **DIIs (Domestic Institutional Investors)** — LIC, SBI Mutual Fund, HDFC AMC. These are the counter-weight to FIIs. When FIIs sell, DIIs often buy (and vice versa). This tug-of-war drives a lot of market movement.

- **Mutual Funds & SIP flows** — Every month, crores of rupees flow into the market through SIPs. This creates a steady buying pressure, especially in large-cap stocks.

### Market Makers

These are entities that provide **liquidity** by always being willing to buy and sell. They profit from the bid-ask spread (more on this in a second). In India, market makers are especially important in the derivatives (F&O) segment.

### HFT Firms (High-Frequency Traders)

Algorithmic traders with co-located servers *inside* the exchange, executing thousands of trades per second. They're the reason that matching engine needs to be so fast. As a developer, you can appreciate the engineering — these systems are latency-optimized down to the nanosecond.

**Why does this matter?** Because when you see a stock suddenly drop 2% in five minutes with no news, it's probably not retail traders panicking. It's likely institutional flow or algorithmic activity. Knowing *who* is moving the market helps you not panic-sell at the worst time.

## Reading a Stock Quote

Pull up any stock on Kite or any trading app. Here's what you're actually looking at:

### OHLC — The Four Sacred Numbers

Every time period (whether it's a 1-minute bar or a full trading day) has four prices:

- **Open** — The first traded price of the period
- **High** — The highest price reached
- **Low** — The lowest price reached
- **Close** — The last traded price of the period

For example, if TCS on a given day shows O: ₹3,800 | H: ₹3,850 | L: ₹3,775 | C: ₹3,830 — it opened at 3,800, went as high as 3,850, dipped to 3,775, and ended at 3,830. The close being above the open? Buyers won the day.

### Bid & Ask (The Real Price)

The "price" you see isn't really one number. It's two:

- **Bid** — The highest price someone is *willing to pay* right now (buyers)
- **Ask (Offer)** — The lowest price someone is *willing to sell* at right now (sellers)

The gap between them is the **spread**. Highly liquid stocks like Reliance might have a spread of ₹0.05. Some small-cap stock? Could be ₹2-5. The tighter the spread, the easier it is to get in and out.

### Market Depth

Your trading app shows the top 5 (or 20) bid and ask levels. This is the **market depth** — a window into the order book. You'll see something like:

| Bid Qty | Bid Price | Ask Price | Ask Qty |
|---------|-----------|-----------|---------|
| 5,000   | ₹2,498   | ₹2,499   | 3,200   |
| 8,500   | ₹2,497   | ₹2,500   | 12,000  |
| 3,200   | ₹2,496   | ₹2,501   | 7,800   |

This tells you there's decent buying interest at ₹2,497-2,498 (support forming) and some resistance at ₹2,500 (12,000 shares sitting there). We'll talk more about support and resistance later — it's the most important concept in this entire post.

### Volume

The total number of shares traded in a period. High volume = conviction. If a stock breaks out on 3x its average volume, that move has weight. If it breaks out on low volume, be skeptical — it might reverse.

## Order Types — Your Trading Toolkit

This is where most beginners get confused, and it's actually straightforward once you see it.

### Market Order

"Buy/sell RIGHT NOW at whatever the current price is."

You get instant execution but zero price control. Fine for highly liquid stocks like Nifty futures or Reliance. Dangerous for illiquid small-caps where the spread is wide — you might end up buying at a much higher price than expected (this is called **slippage**).

### Limit Order

"Buy/sell ONLY at this price or better."

You set a specific price. If the market doesn't reach your price, the order stays open. You get price control but no execution guarantee. This is what you should use 90% of the time.

Example: Infosys is trading at ₹1,600. You place a limit buy at ₹1,585. Your order sits in the order book until either someone sells at ₹1,585, or the market closes and your order expires.

### Stop-Loss Order (SL)

"If the price hits X, trigger my order."

This is your emergency exit. You buy TCS at ₹3,800, you set a stop-loss at ₹3,750. If TCS drops to ₹3,750, your sell order gets triggered automatically. Think of it as a `try-catch` for your trades — you hope it never fires, but you always want it there.

There are two variants:
- **SL (Stop-Loss Limit)** — Triggers a limit order at your specified price
- **SL-M (Stop-Loss Market)** — Triggers a market order (guaranteed exit, but possible slippage)

### GTT (Good Till Triggered)

A Zerodha-specific feature (other brokers have equivalents). It's a stop-loss or target order that stays active for up to a year. You set it and forget it. Perfect for long-term positions where you want automatic risk management without watching the screen daily.

### AMO (After Market Order)

Place orders between 3:45 PM and 8:57 AM (outside market hours). They queue up and execute when the market opens. Great for people with day jobs who want to react to overnight news or set up trades the night before.

**Pro tip:** Always use limit orders and always set a stop-loss. Market orders + no stop-loss is how accounts blow up.

## Candlestick Charts 101

Okay, those red and green bars. They're not random art — they're the most information-dense way to visualize price movement.

Each candlestick represents one time period (1 minute, 1 day, whatever your chart is set to) and shows you the OHLC data we discussed earlier, but visually:

### Anatomy of a Candle

```
    |        ← Upper wick/shadow (High)
  ┌─┴─┐
  │   │      ← Body (Open to Close)
  └─┬─┘
    |        ← Lower wick/shadow (Low)
```

- **Green (bullish) candle**: Close > Open. Buyers dominated.
- **Red (bearish) candle**: Close < Open. Sellers dominated.
- **The body** shows the range between open and close — the "real" battle zone.
- **The wicks** show the extremes — how far price explored before pulling back.

### What the Shapes Tell You

- **Long green body, tiny wicks** — Strong buying, no hesitation. Bulls in control.
- **Long red body, tiny wicks** — Strong selling. Bears in control.
- **Small body, long wicks** (called a **Doji**) — Indecision. Neither side won. Often appears at turning points.
- **Long lower wick, small body at top** (called a **Hammer**) — Price dropped hard but buyers pushed it back up. Potentially bullish if it appears after a downtrend.
- **Long upper wick, small body at bottom** (called a **Shooting Star**) — Price spiked up but sellers slammed it back down. Potentially bearish after an uptrend.

Don't memorize 50 candle patterns from a textbook. Focus on understanding the *story* each candle tells: who won (buyers or sellers), by how much, and where was the rejection.

## Timeframes — Zooming In and Out

The same stock can look bullish on a daily chart and bearish on a 5-minute chart. This isn't a bug — it's a feature. Different timeframes serve different purposes.

### Common Timeframes

- **1-minute / 5-minute** — For scalpers and intraday traders. Lots of noise, fast-moving. You need to be glued to the screen.
- **15-minute** — The sweet spot for intraday trading in India. Less noise than 5-min, still gives you enough entries and exits within a trading day.
- **1-hour** — For swing traders who hold for 2-7 days. Good balance of signal vs. noise.
- **Daily** — The most important timeframe. If you only look at one chart, make it the daily. Institutional traders, fund managers — everyone watches the daily chart.
- **Weekly** — For investors and position traders. Shows the big picture trend. If the weekly trend is up, you generally want to be buying, not shorting.

### Which One Should You Use?

Here's a simple framework:

| Your Style | Primary TF | Higher TF (Trend) |
|------------|-----------|-------------------|
| Scalping | 1-5 min | 15 min |
| Intraday | 15 min | 1 hour / Daily |
| Swing (2-10 days) | 1 hour / Daily | Weekly |
| Positional (weeks-months) | Daily | Weekly / Monthly |

**The golden rule:** Always check the higher timeframe first to understand the trend, then drop down to your trading timeframe for entries. Trading against the higher timeframe trend is like swimming upstream — possible, but exhausting and usually unprofitable.

## Support & Resistance — The Most Important Concept

If you remember only one thing from this entire post, let it be this section. Support and resistance is the foundation of *all* technical trading.

### What Are They?

- **Support** — A price level where buying interest is strong enough to prevent the price from falling further. Think of it as a floor.
- **Resistance** — A price level where selling interest is strong enough to prevent the price from rising further. Think of it as a ceiling.

### Why Do They Work?

They work because of **human psychology and memory**. Here's a real scenario:

Imagine Nifty drops to 22,000 and bounces back to 22,800. Everyone who bought near 22,000 is happy. Everyone who missed the bounce is thinking: "If it comes back to 22,000, I'm buying." Everyone who sold near 22,000 is regretting it and thinking: "If I get another chance at 22,000, I'm buying back."

When Nifty actually comes back to 22,000, all three groups want to buy. That collective memory creates real buying pressure — and the level holds. That's support.

The reverse happens at resistance. If Nifty hits 23,500 and gets rejected twice, the third approach to 23,500 will see profit-booking, short-selling, and general nervousness. That's resistance.

### How to Identify Them

1. **Previous swing highs and lows** — The most reliable method. Look at where price reversed before.
2. **Round numbers** — ₹2,000, ₹500, Nifty 25,000. Humans love round numbers, and they place orders there.
3. **High-volume zones** — Areas where lots of trading happened act as magnets and barriers.

### The Flip

Here's the elegant part: **when support breaks, it becomes resistance. When resistance breaks, it becomes support.** This is called a "polarity flip" and it's one of the most reliable patterns in markets.

Example: Reliance has resistance at ₹2,600 for weeks. It finally breaks above ₹2,600 on strong volume. Next time it pulls back, ₹2,600 now acts as *support*. Previous sellers are now buyers.

As a developer, think of it like a state transition — once a level flips, its role in the system changes entirely.

### Putting It Together

When price approaches support with bullish candles and increasing volume → potential long (buy) opportunity.

When price approaches resistance with bearish candles or weakening momentum → potential short or exit opportunity.

When support or resistance breaks with strong volume → trend continuation. Don't fight it.

---

## What's Next?

That was a lot — and we covered it fast. Don't worry about memorizing everything. Open your charting app (TradingView is free and excellent), pull up Nifty or Reliance, and start *seeing* what we talked about:

- Find the support and resistance levels on a daily chart
- Look at candlestick wicks — who won each day?
- Check the market depth on your broker's app
- Place a paper (simulated) trade with a limit order and a stop-loss

Tomorrow in **Day 2**, we'll dive into **trend analysis and moving averages** — how to figure out whether you should be buying, selling, or sitting on your hands.

*If you already know options basics, check out my [Options Trading 101](/blog/options-trading-101) post — but I'd recommend getting comfortable with these foundations first.*

See you tomorrow. 🚀
