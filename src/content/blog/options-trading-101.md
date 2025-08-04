---
title: "Options Trading 101"
description: "An introduction to options trading, covering the basics and key strategies."
tags: ["trading", "f&o", "sahi"]
pubDate: 2024-08-03
publish: true
---

Just some notes I took while learning options trading and building a trading platform at Sahi.

Options are contracts giving you the right (not obligation) to buy/sell an underlying at a strike price before expiration.

**Call Options:**

- Buyers profit when spot > strike (unlimited upside)
- Sellers profit when spot < strike but face unlimited risk
- Example: Buy NIFTY 20,000 call for ₹100 premium, profit ₹400 if it closes at 20,500 (₹500 intrinsic value - ₹100 premium). Seller receives ₹100 premium but loses ₹400 as they must deliver at 20,000 when spot is 20,500

**Put Options:**

- Buyers profit when spot < strike
- Sellers profit when spot > strike
- Example: Buy NIFTY 20,000 put for ₹100 premium, profit ₹400 if it closes at 19,500 (₹500 intrinsic value - ₹100 premium). Seller receives ₹100 premium but loses ₹400 as they must buy at 20,000 when spot is 19,500

Key reminder: Option buyers have limited risk (premium paid) but sellers face potentially unlimited losses, especially on calls.

## Key Terminologies

**Basic Terms:**

- **Premium**: The price you pay to buy an option or receive for selling one. This is your maximum loss as a buyer or immediate profit as a seller
- **Strike Price**: The price at which you can exercise the option (buy for calls, sell for puts)
- **Expiry**: The date when the option contract expires. In India, monthly options expire on the last Thursday of each month
- **Open Interest (OI)**: Total number of outstanding option contracts that haven't been settled. High OI indicates strong interest at that strike

**Moneyness:**

- **ITM (In The Money)**: Calls with their `strike < spot`, puts with their `strike > spot`. These have intrinsic value
- **ATM (At The Money)**: Options with their strike ≈ spot. Highest time value and most liquid
- **OTM (Out of The Money)**: Calls with their `strike > spot`, puts with their `strike < spot`. Only time value, no intrinsic value

**Valuation:**

- **Intrinsic Value**: The immediate exercise value. For calls: `max(spot - strike, 0)`. For puts: `max(strike - spot, 0)`
- **Time Value**: `Premium - Intrinsic Value`. Decays as expiry approaches (theta decay)
- **Implied Volatility (IV)**: Market's expectation of future price movement. Higher IV = higher premiums. Often spikes before events

**The Greeks:**

- **Delta**: Price sensitivity. How much option price changes per ₹1 move in underlying. Calls: 0 to 1, Puts: 0 to -1
- **Gamma**: Delta's rate of change. Higher for ATM options. Shows how delta accelerates
- **Theta**: Time decay. How much premium erodes daily. Always negative for buyers, positive for sellers
- **Vega**: IV sensitivity. How much option price changes per 1% change in implied volatility
- **Rho**: Interest rate sensitivity. Usually least important for short-term trades

## Market Indicators and Advanced Concepts

**Max Pain:**

Max Pain is the strike price where the maximum number of options (both calls and puts) expire worthless, causing maximum financial pain to option buyers and maximum profit to option sellers.

Think of it this way: imagine you're an option seller (market maker) who has sold both calls and puts across various strikes. You want the market to close at a price where most of these options become worthless, so you don't have to pay out. Max Pain theory suggests that market makers, having deep pockets and sophisticated strategies, will try to push the market toward this price near expiry.

**How it works:** Calculate the total value of calls and puts that would be ITM at each strike price. The strike with the lowest total value is Max Pain.

**Application:** Many traders watch Max Pain as a potential target for where the market might gravitate toward expiry. However, it's not a guarantee - just one factor among many. It tends to be more relevant on expiry days when time decay is maximum.

**PCR (Put-Call Ratio):**

PCR measures the ratio of put options to call options, either by volume or open interest. It's calculated as: `Total Put Volume (or OI) / Total Call Volume (or OI)`.

The intuition is simple: if more people are buying puts than calls, it suggests bearish sentiment (people expect the market to fall). If more people are buying calls, it suggests bullish sentiment.

**Interpreting PCR:**

- PCR > 1: More puts than calls (bearish sentiment)
- PCR < 1: More calls than puts (bullish sentiment)
- PCR around 0.7-1.3: Generally considered normal range

**Application:** PCR is often used as a contrarian indicator. When PCR gets extremely high (say above 1.5), it might indicate oversold conditions and a potential bounce. When extremely low (below 0.5), it might indicate overbought conditions. The logic is that when everyone is positioned one way, the market often moves the opposite direction.

**ATM Straddle Price:**

An ATM straddle involves buying both a call and put option at the same strike price (closest to current spot price) with the same expiry.

Think of it as making a bet that the market will move significantly in either direction, but you don't know which way. You profit if the market moves beyond your breakeven points in either direction.

**The price tells you:** The ATM straddle price represents the market's expectation of how much the underlying might move by expiry. If NIFTY is at 20,000 and the ATM straddle costs ₹400, the market expects NIFTY to move at least 400 points (either to 19,600 or 20,400) for the straddle buyer to breakeven.

**Application:**

- **Before events:** Straddle prices often increase before earnings, policy announcements, or major events as volatility expectations rise
- **Market timing:** If you expect a big move but don't know the direction, you might buy a straddle
- **Volatility trading:** Straddle prices help you understand if volatility is expensive or cheap

**ATM IV (Implied Volatility):**

ATM IV is the implied volatility of at-the-money options. It represents the market's expectation of how volatile the underlying will be until expiry.

Here's the intuition: if people expect the market to be very choppy and move a lot, they'll pay higher premiums for options. This higher premium translates to higher implied volatility. If people expect calm, sideways movement, premiums will be lower, leading to lower IV.

**Understanding IV levels:**

- High IV (above historical averages): Market expects big moves, options are expensive
- Low IV (below historical averages): Market expects calm conditions, options are cheap
- IV often spikes during uncertainty and crashes after events (IV crush)

**Application:**

- **Option buying:** Prefer buying when IV is low (cheaper premiums)
- **Option selling:** Prefer selling when IV is high (collect higher premiums)
- **Event trading:** IV usually spikes before events and collapses after, regardless of the actual move

**Synthetic Future Price:**

A synthetic future is created by buying a call and selling a put at the same strike price and expiry. This combination mimics the payoff of owning the underlying asset.

Here's why: If the market goes up, your call gains value while the put you sold expires worthless. If the market goes down, your call expires worthless but you lose money on the put you sold (since you have to buy at the higher strike when market is lower). This creates the same profit/loss profile as owning the underlying.

**The price relationship:** In theory, `Synthetic Future Price = Strike + Call Premium - Put Premium`. This should equal the actual future price. When there's a difference, it creates arbitrage opportunities.

**Application:**

- **Arbitrage:** If synthetic future price differs significantly from actual future price, sophisticated traders can profit from this mismatch
- **Cost efficiency:** Sometimes it's cheaper to create synthetic positions than buying the underlying directly
- **Strategy building:** Understanding synthetics helps in creating complex strategies and understanding position equivalencies

**Key Insight:** All these indicators work together. For example, high ATM IV often coincides with high straddle prices (since straddle prices increase with volatility). PCR might spike when people expect a fall, which could also increase put IVs. Max Pain becomes more relevant when overall option activity is high. Understanding these relationships helps you build a complete picture of market sentiment and positioning.
