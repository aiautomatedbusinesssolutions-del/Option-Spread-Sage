# Options Spread Sage - Implementation Plan

**Context:** Build a zero-API options spread flight simulator that teaches beginners how spreads work through interactive time-travel, visual gauges, and plain-English translations. All data is synthetically generated using Black-Scholes math and seeded random price paths.

**Tech Stack:** Vite + React + TypeScript + Tailwind CSS v4 + Zustand

---

## Phase 1: Scaffolding

Create the Vite + React + TypeScript project with Tailwind v4 and Zustand. Establish the full directory structure, global design tokens (bg-slate-950, Inter font, traffic light palette), and a Hello World rendering.

**Files to create:**
- `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `index.html`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Directory stubs: `src/components/`, `src/lib/`, `src/stores/`, `src/types/`, `src/hooks/`, `src/data/`
- `src/components/ui/Card.tsx`, `src/components/ui/Button.tsx` (reusable primitives)

**Verify:** `npm run dev` shows styled Hello World page with dark theme.

---

## Phase 2: Data Engine (Math Core)

Port and extend the proven Black-Scholes implementation from `c:\dev\apps\30 Finance apps\option-gage\lib\math\black-scholes.ts`. Build the synthetic data generation layer.

**Files to create:**
- `src/types/market.ts` — `TickerProfile`, `DailyBar`, `PricePath`, `ScenarioType`
- `src/types/options.ts` — `OptionContract`, `Greeks`, `OptionsChain`, `ExpirationChain`, `SpreadLeg`, `SpreadPosition`
- `src/types/portfolio.ts` — `Trade`, `Portfolio`
- `src/lib/math/black-scholes.ts` — Port from option-gage, add `gamma`, `rho`, `normPDF` export
- `src/lib/math/spreads.ts` — Combined spread P/L calculator, net Greeks for multi-leg positions
- `src/lib/math/probability.ts` — Probability of profit using normCDF on breakeven distance
- `src/lib/engine/seedrandom.ts` — Mulberry32 seeded PRNG + Box-Muller transform for reproducible paths
- `src/lib/engine/priceGenerator.ts` — Geometric Brownian Motion: `S(t+1) = S(t) * exp((mu - sigma^2/2)*dt + sigma*sqrt(dt)*Z)`
- `src/lib/engine/optionsChain.ts` — Generate chain from price + date: 21 strikes x 4 expirations, IV smile/skew
- `src/lib/engine/ivSurface.ts` — Volatility smile: `iv(K) = baseIV * (1 + skew*(moneyness-1)^2 + put_skew*min(0, moneyness-1))`
- `src/data/tickers.ts` — 15 ticker profiles (AAPL, SPY, NVDA, TSLA, MSFT, AMZN, GOOGL, META, AMD, JPM, QQQ, IWM, BA, DIS, COIN)
- `src/data/scenarios.ts` — 5 scenario configs: bull_rally, bear_crash, sideways, iv_crush, gradual_decay

**Key formulas (Black-Scholes with dividends):**
- `d1 = (ln(S/K) + (r - q + sigma^2/2) * T) / (sigma * sqrt(T))`
- `d2 = d1 - sigma * sqrt(T)`
- Call = `S*e^(-qT)*N(d1) - K*e^(-rT)*N(d2)`
- Put = `K*e^(-rT)*N(-d2) - S*e^(-qT)*N(-d1)`
- Gamma = `e^(-qT) * n(d1) / (S * sigma * sqrt(T))`
- Theta returned per-day (÷365), Vega returned per 1% IV move (÷100)

**Performance note:** 21 strikes x 4 expirations x 2 types = 168 contracts. Black-Scholes is ~10 ops each. <2ms total per time step — no pre-computation needed.

**Verify:** Console test that generates a price path and options chain with realistic values.

---

## Phase 3: Time Machine Engine + Simulation Store

Build the core simulation state and DVD-style time controls.

**Files to create:**
- `src/stores/simulationStore.ts` — Zustand store: currentDay, playbackState (playing/paused), speed, selectedTicker, selectedScenario, pricePath, chain
- `src/lib/engine/simulation.ts` — Time-step logic: advance day/week, recalculate chain, expire contracts, update positions
- `src/components/controls/TimeControls.tsx` — DVD buttons: rewind, step-back-day, play/pause, step-forward-day, step-forward-week, speed selector
- `src/components/layout/Header.tsx` — Ticker search bar + scenario dropdown picker
- `src/components/layout/MainLayout.tsx` — Responsive 3-panel grid (collapses to tabs on mobile)

**Behavior:**
- Play: auto-advance 1 day per interval (configurable speed: 1s, 500ms, 250ms)
- Step Day: advance exactly 1 trading day
- Step Week: advance 5 trading days
- Each step: read price from pre-generated path → recalculate IV from schedule → rebuild options chain → update all position P/L

**Verify:** Click step buttons, see current date + stock price update on screen.

---

## Phase 4: Price Chart + Ghost Line

Render the stock price history as a candlestick chart with a vertical "ghost price" line showing current simulation position.

**Files to create:**
- `src/components/charts/PriceChart.tsx` — Canvas2D candlestick chart. Past candles rendered, future candles hidden. Ghost vertical line at current day.

**Reuse:** No charting library needed — custom Canvas2D for performance.

**Verify:** Chart renders candles up to current day, ghost line tracks as time advances.

---

## Phase 5: Spread Builder + Blueprint Library

One-click spread templates and manual leg configuration.

**Files to create:**
- `src/stores/spreadStore.ts` — Zustand store: current spread legs, computed net Greeks, P/L at various prices
- `src/data/spreadTemplates.ts` — Template functions: Bull Call, Bear Put, Iron Condor, Butterfly, Credit Spreads. Each takes (currentPrice, expiryDate) and returns SpreadLeg[]
- `src/components/spread/SpreadBlueprintLibrary.tsx` — Card grid of template buttons with icons + plain English descriptions
- `src/components/spread/SpreadBuilder.tsx` — Active spread configuration panel
- `src/components/spread/LegCard.tsx` — Single leg display: "BUY 1 AAPL $185 Call @ $4.50" in plain English
- `src/components/spread/TugOfWarVisual.tsx` — Visual showing bought leg pulling profit up, sold leg as anchor (pays rent via theta)

**Plain English leg breakdown examples:**
- Bull Call: "You're BUYING a cheaper call (betting stock goes up) and SELLING a more expensive call (to reduce your cost). Your max profit is capped, but so is your risk."
- Iron Condor: "You're SELLING two options near the current price (collecting rent) and BUYING two options further away (as insurance). You profit if the stock stays still."

**Verify:** Click a template, see legs populate with correct strikes relative to current price.

---

## Phase 6: P/L Canvas + Theta Decay Visualizer

Dynamic profit/loss diagram with green/red zones and theta decay animation.

**Files to create:**
- `src/hooks/usePLCurve.ts` — Compute P/L at expiration across a range of stock prices for the current spread
- `src/components/charts/PLCanvas.tsx` — SVG-based P/L diagram: green fill above zero, red fill below zero, ghost vertical line at current stock price, breakeven markers
- `src/components/charts/ThetaDecayViz.tsx` — Overlay showing current-day P/L curve vs expiration P/L curve. As time advances, watch the "today" curve shrink toward the expiration curve.

**Key visual:** The ghost price line moves through green/red zones as simulation time advances, showing real-time whether the trade is winning or losing.

**Verify:** Deploy a bull call spread, advance time, watch P/L zones shift and theta eat into the profit curve.

---

## Phase 7: Greek Gauges + Probability Meter

Beginner-friendly semicircle safety gauges with plain English translations.

**Files to create:**
- `src/components/ui/Gauge.tsx` — Reusable semicircle arc gauge component with traffic light coloring
- `src/hooks/useGreeks.ts` — Compute aggregate Greeks for the current spread
- `src/components/gauges/GreekGauges.tsx` — Container layout
- `src/components/gauges/DeltaGauge.tsx` — "Move Gauge": how much profit changes if stock moves $1
- `src/components/gauges/ThetaGauge.tsx` — "Decay Gauge": how much money lost/gained per 24 hours
- `src/components/gauges/VegaGauge.tsx` — "Volatility Gauge": how much gained/lost if market gets scared/calm
- `src/components/gauges/ProbabilityMeter.tsx` — Real-time probability of profit, updates as strikes are changed
- `src/lib/math/probability.ts` — (already created in Phase 2, wire it to the UI here)

**Plain English translations below each gauge:**
- Theta -0.05 → "Time is currently eating $5 of your profit every day. You need the stock to move faster to stay ahead."
- Delta 0.35 → "If the stock moves up $1, you gain about $35. If it drops $1, you lose about $35."
- Vega 0.12 → "If the market gets 1% more scared (volatility rises), you gain $12. If it calms down, you lose $12."

**Verify:** Gauges render, update in real-time as time advances, plain English text is accurate.

---

## Phase 8: Paper Pilot Dashboard

Simulated trading with bankroll management and risk warnings.

**Files to create:**
- `src/stores/portfolioStore.ts` — Zustand store: bankroll ($10k start), openPositions, tradeLog, totalPnL
- `src/components/dashboard/PaperPilotDashboard.tsx` — Bankroll display, session stats
- `src/components/dashboard/TradeLog.tsx` — History table of every simulated trade with win/loss outcome
- `src/components/dashboard/RiskWarning.tsx` — Alert when trade risks >5% of bankroll ("This one trade could end your flight!")

**Risk warning triggers:**
- Max loss of spread > 5% of current bankroll → red alert modal
- Spread has unlimited risk (naked short) → danger warning explaining why
- Probability of profit < 30% → amber warning

**Verify:** Place a trade, see bankroll decrease, advance to expiration, see P/L settle and trade log update.

---

## Phase 9: Language Translator + Alerts + Visual Polish

Hover tooltips, expiration warnings, pain point notifications, and mobile responsiveness.

**Files to create:**
- `src/hooks/useTooltip.ts` — Jargon translator hook
- `src/components/ui/Tooltip.tsx` — Hover overlay that explains terms (strike, expiration, ITM/OTM, credit/debit, pin risk)
- `src/components/alerts/ExpirationWarning.tsx` — Danger zone visual when within 24 hours (1 trading day) of expiration. Explains pin risk.
- `src/components/alerts/BottomLineSummary.tsx` — Constantly updating plain English box: "In this trade, you're betting AAPL stays between $180 and $190 until March 21st. You collected $2.50 upfront and can lose up to $7.50 if wrong."
- `src/data/translations.ts` — Dictionary mapping jargon → plain English

**Pain point notifications:**
- "You picked the right direction! But you're losing $50 today because volatility dropped faster than the price moved (IV Crush)."
- "Your max loss is $500, but there's only a 25% chance this trade profits. That's closer to gambling than investing."

**Mobile:** Collapse 3-panel layout to tabbed single-column with large touch targets.

**Verify:** Hover over terms to see tooltips, trigger expiration warning, see bottom line summary update.

---

## Phase 10: Final Integration + Edge Cases

Wire all systems together. End-to-end testing of the full simulation loop.

**Tasks:**
- Ensure time advancement updates ALL panels simultaneously (chart, P/L, gauges, dashboard, summary)
- Handle edge cases: expiration at zero DTE, extreme IV values, bankroll depletion, no spread selected
- Confirm scenario switching resets everything cleanly
- Verify strike dragging updates probability meter in real-time
- Test all 5 spread templates across all scenarios
- Mobile responsiveness pass
- Remove any console logs, unused imports
- Final build check: `npm run build`

**Verify:** `npm run build` succeeds with zero errors.

---

## Key Reusable Code

- **Black-Scholes engine:** Port from [black-scholes.ts](../option-gage/lib/math/black-scholes.ts) — already has `normCDF`, `callPrice`, `putPrice`, `delta`, `theta`, `vega` with edge case handling. Add `gamma`, `rho`, `normPDF` export.

## Verification

```bash
npm run build
```
