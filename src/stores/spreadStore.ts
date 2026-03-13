import { create } from "zustand";
import type { Greeks, SpreadLeg } from "../types/options";
import { netGreeks, analyzeSpread } from "../lib/math/spreads";

interface SpreadState {
  legs: SpreadLeg[];
  ticker: string;
  entryDay: number;
  netDebit: number;
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
  greeks: Greeks;

  setLegs: (legs: SpreadLeg[], currentPrice: number, ticker: string, currentDay: number) => void;
  clearSpread: () => void;
}

const emptyGreeks: Greeks = { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };

export const useSpreadStore = create<SpreadState>((set) => ({
  legs: [],
  ticker: "",
  entryDay: 0,
  netDebit: 0,
  maxProfit: 0,
  maxLoss: 0,
  breakevens: [],
  greeks: emptyGreeks,

  setLegs: (legs, currentPrice, ticker, currentDay) => {
    if (legs.length === 0) {
      set({ legs: [], ticker: "", entryDay: 0, netDebit: 0, maxProfit: 0, maxLoss: 0, breakevens: [], greeks: emptyGreeks });
      return;
    }

    const r = 0.05;
    const analysis = analyzeSpread(legs, currentPrice, r);

    // Use average DTE across legs for Greeks
    const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
    const T = avgDTE / 252;
    const greeks = netGreeks(legs, currentPrice, T, r);

    set({
      legs,
      ticker,
      entryDay: currentDay,
      netDebit: analysis.netDebit,
      maxProfit: analysis.maxProfit,
      maxLoss: analysis.maxLoss,
      breakevens: analysis.breakevens,
      greeks,
    });
  },

  clearSpread: () => {
    set({ legs: [], ticker: "", entryDay: 0, netDebit: 0, maxProfit: 0, maxLoss: 0, breakevens: [], greeks: emptyGreeks });
  },
}));
