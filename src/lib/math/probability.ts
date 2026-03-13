import { normCDF } from "./black-scholes";
import { spreadPnLAtPrice } from "./spreads";
import type { SpreadLeg } from "../../types/options";

/**
 * Probability that the stock price ends above a target price,
 * given current price, volatility, and time to expiry.
 * Uses log-normal distribution assumption.
 */
export function probAbove(
  S: number,
  target: number,
  T: number,
  sigma: number,
  r: number = 0.05,
  q: number = 0
): number {
  if (T <= 0) return S >= target ? 1 : 0;
  if (target <= 0) return 1;
  const d2 =
    (Math.log(S / target) + (r - q - (sigma * sigma) / 2) * T) /
    (sigma * Math.sqrt(T));
  return normCDF(d2);
}

/**
 * Probability that the stock price ends below a target price.
 */
export function probBelow(
  S: number,
  target: number,
  T: number,
  sigma: number,
  r: number = 0.05,
  q: number = 0
): number {
  return 1 - probAbove(S, target, T, sigma, r, q);
}

/**
 * Probability that the stock price ends between two targets.
 */
export function probBetween(
  S: number,
  lower: number,
  upper: number,
  T: number,
  sigma: number,
  r: number = 0.05,
  q: number = 0
): number {
  return probAbove(S, lower, T, sigma, r, q) - probAbove(S, upper, T, sigma, r, q);
}

/**
 * Probability of profit for a spread given its breakeven points and legs.
 * Classifies each region between breakevens by sampling actual payoff
 * to determine which regions are profitable, then sums their probabilities.
 */
export function probabilityOfProfit(
  S: number,
  breakevens: number[],
  T: number,
  sigma: number,
  legs: SpreadLeg[],
  r: number = 0.05,
  q: number = 0
): number {
  if (breakevens.length === 0) {
    // No breakevens — either always profitable or always losing.
    // Sample P/L at current price to determine which.
    const pnl = spreadPnLAtPrice(legs, S, 0, r, q);
    return pnl > 0 ? 1 : 0;
  }

  const sorted = [...breakevens].sort((a, b) => a - b);

  // Build regions: (-∞, be[0]), (be[0], be[1]), ..., (be[n-1], +∞)
  // Sample the midpoint of each region to classify as profitable or not.
  let prob = 0;

  // Region below the first breakeven (tail toward 0)
  // Use half the breakeven so the sample is always strictly inside the left-tail region,
  // even when the breakeven is very small.
  const belowMid = sorted[0]! * 0.5;
  if (spreadPnLAtPrice(legs, Math.max(belowMid, 0.001), 0, r, q) > 0) {
    prob += probBelow(S, sorted[0]!, T, sigma, r, q);
  }

  // Interior regions between consecutive breakevens
  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i]!;
    const hi = sorted[i + 1]!;
    const mid = (lo + hi) / 2;
    if (spreadPnLAtPrice(legs, mid, 0, r, q) > 0) {
      prob += probBetween(S, lo, hi, T, sigma, r, q);
    }
  }

  // Region above the last breakeven (tail toward +∞)
  const aboveMid = sorted[sorted.length - 1]! * 1.1;
  if (spreadPnLAtPrice(legs, aboveMid, 0, r, q) > 0) {
    prob += probAbove(S, sorted[sorted.length - 1]!, T, sigma, r, q);
  }

  return Math.max(0, Math.min(1, prob));
}
