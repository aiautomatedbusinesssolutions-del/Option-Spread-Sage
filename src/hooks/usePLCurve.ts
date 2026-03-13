import { useMemo } from "react";
import type { SpreadLeg } from "../types/options";
import { spreadPnLAtPrice } from "../lib/math/spreads";

export interface PLPoint {
  price: number;
  pnl: number;
}

/**
 * Compute P/L curve across a range of stock prices.
 * T = 0 gives expiration P/L; T > 0 gives current-day P/L.
 */
export function usePLCurve(
  legs: SpreadLeg[],
  currentPrice: number,
  T: number = 0,
  steps: number = 200
): PLPoint[] {
  return useMemo(() => {
    if (legs.length === 0) return [];

    const r = 0.05;
    const low = currentPrice * 0.7;
    const high = currentPrice * 1.3;
    const stepSize = (high - low) / steps;

    const points: PLPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const price = low + i * stepSize;
      const pnl = spreadPnLAtPrice(legs, price, T, r);
      points.push({ price, pnl });
    }
    return points;
  }, [legs, currentPrice, T, steps]);
}
