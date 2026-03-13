import type { Greeks, SpreadLeg, SpreadPosition } from "../../types/options";
import {
  optionPrice,
  delta,
  gamma,
  theta,
  vega,
  rho,
} from "./black-scholes";

/**
 * Calculate the net P/L of a spread at a given underlying price and time.
 */
export function spreadPnLAtPrice(
  legs: SpreadLeg[],
  underlyingPrice: number,
  T: number,
  r: number,
  q: number = 0
): number {
  let pnl = 0;
  for (const leg of legs) {
    const currentPrice =
      T <= 0
        ? leg.contract.type === "call"
          ? Math.max(underlyingPrice - leg.contract.strike, 0)
          : Math.max(leg.contract.strike - underlyingPrice, 0)
        : optionPrice(
            underlyingPrice,
            leg.contract.strike,
            T,
            r,
            leg.contract.iv,
            leg.contract.type,
            q
          );

    const sign = leg.direction === "long" ? 1 : -1;
    const entryPrice = leg.contract.price;
    pnl += sign * (currentPrice - entryPrice) * leg.quantity * 100;
  }
  return pnl;
}

/**
 * Calculate net Greeks for a multi-leg spread.
 */
export function netGreeks(
  legs: SpreadLeg[],
  S: number,
  T: number,
  r: number,
  q: number = 0
): Greeks {
  const result: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };

  for (const leg of legs) {
    if (T <= 0) continue;
    const sign = leg.direction === "long" ? 1 : -1;
    const mult = sign * leg.quantity;
    const { strike, type: optType, iv } = leg.contract;

    result.delta += mult * delta(S, strike, T, r, iv, optType, q);
    result.gamma += mult * gamma(S, strike, T, r, iv, q);
    result.theta += mult * theta(S, strike, T, r, iv, optType, q);
    result.vega += mult * vega(S, strike, T, r, iv, q);
    result.rho += mult * rho(S, strike, T, r, iv, optType, q);
  }

  return result;
}

/**
 * Calculate max profit, max loss, and breakevens for a spread by sampling prices.
 */
export function analyzeSpread(
  legs: SpreadLeg[],
  currentPrice: number,
  r: number,
  q: number = 0
): Pick<SpreadPosition, "maxProfit" | "maxLoss" | "breakevens" | "netDebit"> {
  // Net debit = sum of premiums paid - premiums received
  let netDebit = 0;
  for (const leg of legs) {
    const sign = leg.direction === "long" ? 1 : -1;
    netDebit += sign * leg.contract.price * leg.quantity * 100;
  }

  // Detect unbounded risk/profit by probing the tail slope.
  // At expiration the P/L is piecewise-linear, so if the slope between two
  // far-out probes is non-negligible the tail diverges (unbounded).
  const tailLow = 0.01;
  const pnlAtZero = spreadPnLAtPrice(legs, tailLow, 0, r, q);

  // Probe two progressively distant high-side points to measure slope
  const probeA = currentPrice * 10;
  const probeB = currentPrice * 20;
  const pnlProbeA = spreadPnLAtPrice(legs, probeA, 0, r, q);
  const pnlProbeB = spreadPnLAtPrice(legs, probeB, 0, r, q);
  const highSlope = (pnlProbeB - pnlProbeA) / (probeB - probeA);

  const highTailIsLoss = highSlope < -0.001;
  const highTailIsProfit = highSlope > 0.001;

  // Sample P/L at expiration across a wide price range
  const low = currentPrice * 0.1;
  const high = currentPrice * 3.0;
  const steps = 2000;
  const stepSize = (high - low) / steps;

  let maxProfit = pnlAtZero;
  let maxLoss = pnlAtZero;
  const breakevens: number[] = [];
  let prevPnl: number | null = null;
  let prevPrice: number | null = null;

  for (let i = 0; i <= steps; i++) {
    const price = low + i * stepSize;
    const pnl = spreadPnLAtPrice(legs, price, 0, r, q);

    if (pnl > maxProfit) maxProfit = pnl;
    if (pnl < maxLoss) maxLoss = pnl;

    // Detect zero-crossings and interpolate for precise breakeven
    if (prevPnl !== null && prevPrice !== null &&
        ((prevPnl < 0 && pnl >= 0) || (prevPnl >= 0 && pnl < 0))) {
      // Linear interpolation between the two sample points
      const frac = Math.abs(prevPnl) / (Math.abs(prevPnl) + Math.abs(pnl));
      const be = prevPrice + frac * (price - prevPrice);
      breakevens.push(Math.round(be * 100) / 100);
    }
    prevPnl = pnl;
    prevPrice = price;
  }

  // Include the far-probe values in finite extremes before checking divergence
  maxProfit = Math.max(maxProfit, pnlProbeA, pnlProbeB);
  maxLoss = Math.min(maxLoss, pnlProbeA, pnlProbeB);

  // If the high tail is diverging, override with ±Infinity
  if (highTailIsLoss) maxLoss = -Infinity;
  if (highTailIsProfit) maxProfit = Infinity;

  return {
    netDebit,
    maxProfit: isFinite(maxProfit) ? Math.round(maxProfit * 100) / 100 : maxProfit,
    maxLoss: isFinite(maxLoss) ? Math.round(maxLoss * 100) / 100 : maxLoss,
    breakevens,
  };
}
