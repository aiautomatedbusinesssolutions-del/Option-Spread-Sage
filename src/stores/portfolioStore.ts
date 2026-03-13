import { create } from "zustand";
import type { Trade } from "../types/portfolio";
import type { PricePath } from "../types/market";
import type { SpreadLeg } from "../types/options";
import { spreadPnLAtPrice } from "../lib/math/spreads";
import { netGreeks, analyzeSpread } from "../lib/math/spreads";

const STARTING_BANKROLL = 10_000;

interface PortfolioState {
  bankroll: number;
  startingBankroll: number;
  openPositions: Trade[];
  tradeLog: Trade[];
  totalPnL: number;

  placeTrade: (
    ticker: string,
    legs: SpreadLeg[],
    entryDay: number,
    entryPrice: number,
    pricePath: PricePath
  ) => string | null;
  closeTrade: (tradeId: string, exitDay: number) => void;
  settleExpiredTrades: (currentDay: number) => void;
  resetPortfolio: () => void;
}

/**
 * Look up the close price for a given day from a trade's stored price path.
 */
function priceAtDay(pricePath: PricePath, day: number): number {
  const clamped = Math.max(0, Math.min(day, pricePath.bars.length - 1));
  return pricePath.bars[clamped]!.close;
}

/**
 * Compute remaining time to expiry (in years) for a trade's legs at a given day.
 */
function remainingT(legs: SpreadLeg[], currentDay: number, entryDay: number): number {
  const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
  const elapsed = currentDay - entryDay;
  const remaining = Math.max(0, avgDTE - elapsed);
  return remaining / 252;
}

let nextId = 1;

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  bankroll: STARTING_BANKROLL,
  startingBankroll: STARTING_BANKROLL,
  openPositions: [],
  tradeLog: [],
  totalPnL: 0,

  placeTrade: (ticker, legs, entryDay, entryPrice, pricePath) => {
    const r = 0.05;
    const analysis = analyzeSpread(legs, entryPrice, r);
    const { bankroll } = get();

    // Risk warnings
    let warning: string | null = null;
    const maxLossAbs = Math.abs(analysis.maxLoss);

    if (!isFinite(analysis.maxLoss)) {
      warning =
        "This spread has unlimited risk. A single bad move could wipe out your entire bankroll and more.";
    } else if (maxLossAbs > bankroll * 0.05) {
      const pct = ((maxLossAbs / bankroll) * 100).toFixed(0);
      warning = `This trade risks ${pct}% of your bankroll ($${maxLossAbs.toFixed(0)}). That's a lot to bet on one trade.`;
    }

    const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
    const T = avgDTE / 252;
    const greeks = netGreeks(legs, entryPrice, T, r);

    const trade: Trade = {
      id: `trade-${nextId++}`,
      ticker,
      spread: {
        legs,
        netDebit: analysis.netDebit,
        maxProfit: analysis.maxProfit,
        maxLoss: analysis.maxLoss,
        breakevens: analysis.breakevens,
        netGreeks: greeks,
      },
      pricePath,
      entryDay,
      entryPrice,
      exitDay: null,
      exitPrice: null,
      pnl: null,
      status: "open",
    };

    // Debit the cost from bankroll (debit spreads cost money, credits add)
    const cost = Math.max(0, analysis.netDebit);

    set((state) => ({
      bankroll: state.bankroll - cost,
      openPositions: [...state.openPositions, trade],
    }));

    return warning;
  },

  closeTrade: (tradeId, exitDay) => {
    const { openPositions } = get();
    const trade = openPositions.find((t) => t.id === tradeId);
    if (!trade) return;

    const r = 0.05;
    const exitPrice = priceAtDay(trade.pricePath, exitDay);
    const T = remainingT(trade.spread.legs, exitDay, trade.entryDay);
    const pnl = spreadPnLAtPrice(trade.spread.legs, exitPrice, T, r);

    const closedTrade: Trade = {
      ...trade,
      exitDay,
      exitPrice,
      pnl,
      status: "closed",
    };

    set((state) => ({
      openPositions: state.openPositions.filter((t) => t.id !== tradeId),
      tradeLog: [...state.tradeLog, closedTrade],
      bankroll: state.bankroll + Math.max(0, trade.spread.netDebit) + pnl,
      totalPnL: state.totalPnL + pnl,
    }));
  },

  settleExpiredTrades: (currentDay) => {
    const { openPositions } = get();
    const r = 0.05;

    const toExpire = openPositions.filter((t) => {
      const maxExpiry = Math.max(
        ...t.spread.legs.map((l) => l.contract.expiration)
      );
      return currentDay >= maxExpiry;
    });

    if (toExpire.length === 0) return;

    const remaining = openPositions.filter((t) => !toExpire.includes(t));
    let pnlSum = 0;
    let bankrollReturn = 0;

    const settled = toExpire.map((trade) => {
      // Use each trade's own price path to get the correct ticker price
      const exitPrice = priceAtDay(trade.pricePath, currentDay);
      const pnl = spreadPnLAtPrice(trade.spread.legs, exitPrice, 0, r);
      pnlSum += pnl;
      bankrollReturn += Math.max(0, trade.spread.netDebit) + pnl;
      return {
        ...trade,
        exitDay: currentDay,
        exitPrice,
        pnl,
        status: "expired" as const,
      };
    });

    set((state) => ({
      openPositions: remaining,
      tradeLog: [...state.tradeLog, ...settled],
      bankroll: state.bankroll + bankrollReturn,
      totalPnL: state.totalPnL + pnlSum,
    }));
  },

  resetPortfolio: () => {
    set({
      bankroll: STARTING_BANKROLL,
      openPositions: [],
      tradeLog: [],
      totalPnL: 0,
    });
  },
}));
