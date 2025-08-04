---
title: "Options Trading 101"
description: "An introduction to options trading, covering the basics and key strategies."
tags: ["trading", "f&o", "sahi"]
pubDate: 2024-08-03
publish: true
---

Just some notes I took while learning options trading and building a trading platform at Sahi.

## Understanding Options: The Core Intuition

Think of options like insurance contracts. Just as you pay a premium for car insurance that gives you the _right_ (not obligation) to claim money if something happens, options give you the _right_ to buy or sell at a specific price.

**Call Options - Betting on Price Going Up:**

_Intuition:_ You think NIFTY will rise above 20,000, but you don't want to buy the entire index. Instead, you pay ₹100 for the _right_ to buy at 20,000. If NIFTY hits 20,500, you can "buy" at 20,000 and immediately "sell" at 20,500 for ₹500 profit (minus your ₹100 premium = ₹400 net profit).

_As a trader:_

- **Buy calls** when you're bullish but want limited risk
- **Sell calls** when you think the market won't rise much (collect premium income)
- **Risk management:** Call buyers risk only the premium; call sellers face unlimited losses

**Put Options - Betting on Price Going Down:**

_Intuition:_ You think NIFTY will fall below 20,000. You pay ₹100 for the _right_ to sell at 20,000. If NIFTY drops to 19,500, you can "sell" at 20,000 when market price is 19,500, pocketing ₹500 (minus ₹100 premium = ₹400 profit).

_As a trader:_

- **Buy puts** for downside protection or bearish bets with limited risk
- **Sell puts** to collect premium when you think the market won't fall much
- **Strategy tip:** Use puts as portfolio insurance during uncertain times

## Key Terminologies with Trading Applications

**Premium - Your Skin in the Game:**

_Intuition:_ Premium is like paying rent for the right to control an expensive asset. You pay ₹100 to control ₹500,000 worth of NIFTY for a month.

_Trading Applications:_

- **Premium hunting:** Sell options when premiums are inflated (high IV days)
- **Bargain hunting:** Buy options when premiums are cheap (low IV periods)
- **Risk sizing:** Never risk more than 2-5% of your portfolio on option buying
- **Income generation:** Systematic premium selling can generate monthly income

**Strike Price - Your Trigger Level:**

_Intuition:_ This is your "activation price." Below/above this level, your option starts making real money.

_Trading Applications:_

- **Probability assessment:** OTM strikes are cheaper but less likely to succeed
- **Risk-reward balance:** ITM options are safer but more expensive
- **Strike selection strategy:** Choose strikes based on your conviction level

**Expiry - Your Deadline:**

_Intuition:_ Options are like milk - they have an expiration date. The closer to expiry, the faster they lose value if they're not profitable.

_Trading Applications:_

- **Time horizon matching:** Use weekly options for short-term trades, monthly for longer views
- **Expiry day trading:** Markets often move toward Max Pain on expiry
- **Calendar strategies:** Sell near-expiry options while buying longer-dated ones

**Open Interest (OI) - The Crowd Indicator:**

_Intuition:_ OI shows where the "crowd" is placing their bets. High OI strikes act like magnets - price often gravitates toward them.

_Trading Applications:_

- **Support/Resistance:** High OI puts often act as support, high OI calls as resistance
- **Breakout confirmation:** When price moves past high OI levels decisively, big moves follow
- **Contrarian signals:** Extreme OI buildup at one side often leads to opposite moves

**Moneyness - Your Probability Meter:**

_ITM (In The Money) - Already Winning:_
_Intuition:_ These are like being ahead in a race - you're already profitable if you exercised now.
_Trading Application:_ Use ITM options when you want higher probability trades with less leverage

_ATM (At The Money) - On the Edge:_
_Intuition:_ These are the most sensitive to price movements - small moves create big percentage changes.
_Trading Application:_ Best for day trading and when you expect significant moves

_OTM (Out of The Money) - Lottery Tickets:_
_Intuition:_ These are like lottery tickets - cheap but need big moves to pay off.
_Trading Application:_ Use for high-conviction trades or when buying insurance

**Intrinsic Value - Real Money:**

_Intuition:_ This is the "real" value - money you could extract right now. Everything else is hope and time.

_Trading Applications:_

- **Exercise decisions:** Only exercise when intrinsic value exceeds transaction costs
- **Deep ITM strategy:** Focus on intrinsic value when trading deep ITM options
- **Value assessment:** Compare intrinsic vs time value to gauge option attractiveness

**Time Value - The Cost of Hope:**

_Intuition:_ This is what you pay for the possibility that your option becomes more valuable. Like paying extra for a lottery ticket with better odds.

_Trading Applications:_

- **Time decay harvesting:** Sell options to collect time value, especially in the last 30 days
- **Weekend effect:** Time value erodes over weekends even when markets are closed
- **Theta strategies:** Sell ATM options to maximize time decay collection

**Implied Volatility (IV) - The Fear/Greed Gauge:**

_Intuition:_ IV is like the market's anxiety level. When everyone's nervous, they pay more for insurance (options). When everyone's calm, insurance is cheap.

_Trading Applications:_

- **Buy low IV, sell high IV:** Your primary edge in options trading
- **Event trading:** Buy options before events when IV is low, sell when IV spikes
- **IV rank:** Only sell options when IV is in the top 25% of its 52-week range

## The Greeks - Your Risk Dashboard

**Delta - Your Speed Gauge:**

_Intuition:_ Delta tells you how fast your option price moves relative to the stock. A 0.5 delta means your option gains ₹50 when the stock gains ₹100.

_Trading Applications:_

- **Position sizing:** Use delta to calculate equivalent stock exposure
- **Hedging:** If you're long 1000 delta worth of calls, hedge with 1000 shares short
- **Momentum trading:** High delta options for trending markets, low delta for choppy markets

**Gamma - Your Acceleration Meter:**

_Intuition:_ Gamma shows how your delta changes. High gamma means your profits accelerate quickly in your favor (but losses accelerate too).

_Trading Applications:_

- **Scalping:** Use high gamma ATM options for quick trades
- **Risk management:** High gamma positions need constant monitoring
- **Gamma squeeze:** When dealers are short gamma, they amplify price movements

**Theta - Your Daily Expense:**

_Intuition:_ Theta is like a parking meter - it costs you money every day to hold the position.

_Trading Applications:_

- **Income strategies:** Sell options to collect theta daily
- **Time management:** Buy options only when you expect moves within 2 weeks
- **Theta decay acceleration:** Theta increases rapidly in the last 30 days

**Vega - Your Volatility Exposure:**

_Intuition:_ Vega measures how much you gain/lose when market anxiety changes, regardless of price direction.

_Trading Applications:_

- **Volatility trading:** Buy options before earnings, sell after (volatility crush)
- **Market timing:** Sell options when VIX is high, buy when VIX is low
- **Portfolio hedging:** Use high vega options to hedge volatility risk

## Market Indicators and Advanced Applications

**Max Pain - The Dealer's Target:**

_Intuition:_ Imagine you're a casino owner. You want the roulette ball to land where most gamblers lose their bets. Max Pain is that number for options.

_Trading Applications:_

- **Expiry day strategy:** Expect price to gravitate toward Max Pain on expiry
- **Contrarian trades:** When price is far from Max Pain, consider mean reversion
- **Option selling:** Sell strikes away from Max Pain for higher probability wins
- **Weekly planning:** Check Max Pain levels every Monday for the week's bias

**PCR (Put-Call Ratio) - The Sentiment Thermometer:**

_Intuition:_ PCR is like measuring how many people are buying umbrellas vs sunglasses. Too many umbrellas (puts) might mean rain clouds are priced in.

_Trading Applications:_

- **Contrarian signals:** PCR above 1.5 = potential bottom, below 0.5 = potential top
- **Confirmation tool:** Rising PCR with falling prices confirms bearish sentiment
- **Timing entries:** Extreme PCR readings often mark short-term reversal points
- **Daily monitoring:** Track PCR changes to gauge shifting sentiment

**ATM Straddle Price - The Market's Expectation:**

_Intuition:_ This is the market's "minimum movement estimate." If the straddle costs ₹200, the market expects at least a 200-point move in either direction.

_Trading Applications:_

- **Event trading:** If you expect bigger moves than the straddle price suggests, buy it
- **Volatility assessment:** Compare straddle price to historical moves to find value
- **Range trading:** If you expect smaller moves, sell straddles and collect premium
- **Earnings strategy:** Buy straddles 2-3 days before earnings, sell just before announcement

**ATM IV - The Anxiety Index:**

_Intuition:_ ATM IV is like the market's anxiety medication dosage. High IV means everyone's stressed and paying up for protection.

_Trading Applications:_

- **Buy when IV < 20th percentile:** Options are cheap, good for directional trades
- **Sell when IV > 80th percentile:** Options are expensive, good for premium collection
- **IV rank strategy:** Only initiate trades when IV rank supports your strategy
- **Event calendar:** Track earnings/events that typically spike IV

**Synthetic Future Price - The Arbitrage Detector:**

_Intuition:_ This is like comparing the price of buying a car vs leasing with an option to buy. They should cost roughly the same.

_Trading Applications:_

- **Fair value assessment:** When synthetic differs from future price, arbitrage exists
- **Cost efficiency:** Sometimes synthetics are cheaper than direct futures
- **Strategy conversion:** Convert losing long calls to synthetic futures by selling puts
- **Professional edge:** Understanding synthetics helps optimize position management

## Practical Trading Framework

**Pre-Market Routine:**

1. Check ATM IV percentile - determines if you should buy or sell options
2. Review PCR levels - gauge sentiment extremes
3. Identify Max Pain levels - understand dealer targets
4. Assess straddle prices for major events

**Position Management:**

1. **Option buying:** Target 20-50% profits, cut losses at 50%
2. **Option selling:** Target 25-50% of maximum profit, close at 2x credit received loss
3. **Time management:** Close all positions 7 days before expiry
4. **IV management:** Sell when IV rank > 50%, buy when IV rank < 30%

**Risk Rules:**

1. Never risk more than 5% of portfolio on any single options trade
2. Diversify across different expiries and strikes
3. Always define your maximum loss before entering
4. Use stop-losses based on underlying price, not option price

Remember: Options trading is about probabilities, not certainties. Master these concepts, but always respect the market's ability to surprise you.
