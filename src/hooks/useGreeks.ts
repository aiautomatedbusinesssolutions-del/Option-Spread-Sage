import { useMemo } from "react";
import { useSpreadStore } from "../stores/spreadStore";
import { useSimulationStore } from "../stores/simulationStore";
import { netGreeks } from "../lib/math/spreads";
import { probabilityOfProfit } from "../lib/math/probability";

export function useGreeks() {
  const { legs, breakevens, entryDay } = useSpreadStore();
  const { currentPrice, currentDay } = useSimulationStore();

  return useMemo(() => {
    if (legs.length === 0) {
      return {
        delta: 0,
        gamma: 0,
        theta: 0,
        vega: 0,
        rho: 0,
        probProfit: 0,
      };
    }

    const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
    const elapsed = currentDay - entryDay;
    const remainingDTE = Math.max(0, avgDTE - elapsed);
    const T = remainingDTE / 252;
    const r = 0.05;

    const greeks = netGreeks(legs, currentPrice, T, r);

    // Average IV across legs for probability calculation
    const avgIV = legs.reduce((s, l) => s + l.contract.iv, 0) / legs.length;
    const probProfit = probabilityOfProfit(
      currentPrice,
      breakevens,
      T,
      avgIV,
      legs,
      r
    );

    return {
      delta: greeks.delta,
      gamma: greeks.gamma,
      theta: greeks.theta,
      vega: greeks.vega,
      rho: greeks.rho,
      probProfit,
    };
  }, [legs, breakevens, entryDay, currentPrice, currentDay]);
}
