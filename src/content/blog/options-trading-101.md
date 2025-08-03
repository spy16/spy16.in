---
title: "Options Trading 101"
description: "An introduction to options trading, covering the basics and key strategies."
tags: ["trading", "f&o", "sahi"]
pubDate: 2024-08-03
publish: true
---

Just some notes I took while learning options trading and building a trading platform at Sahi.

## Quick Refresher

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
