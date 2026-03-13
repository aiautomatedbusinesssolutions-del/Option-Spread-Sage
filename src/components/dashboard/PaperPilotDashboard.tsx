import { usePortfolioStore } from "../../stores/portfolioStore";
import { useSpreadStore } from "../../stores/spreadStore";
import { useSimulationStore } from "../../stores/simulationStore";
import { spreadPnLAtPrice } from "../../lib/math/spreads";
import { RiskWarning } from "./RiskWarning";
import { TradeLog } from "./TradeLog";
import { ExpirationWarning } from "../alerts/ExpirationWarning";
import { Button } from "../ui/Button";
import { useEffect, useRef, useState } from "react";
import type { Trade } from "../../types/portfolio";

export function PaperPilotDashboard() {
  const { bankroll, startingBankroll, openPositions, totalPnL, placeTrade, settleExpiredTrades, resetPortfolio } =
    usePortfolioStore();
  const { legs, ticker, maxLoss, netDebit } = useSpreadStore();
  const { currentDay, currentPrice, pricePath } = useSimulationStore();

  const prevDay = useRef(currentDay);

  // Auto-settle expired trades when day advances
  useEffect(() => {
    if (currentDay !== prevDay.current) {
      prevDay.current = currentDay;
      settleExpiredTrades(currentDay);
    }
  }, [currentDay, currentPrice, settleExpiredTrades]);

  const bankrollChange = bankroll - startingBankroll;
  const bankrollPct = ((bankrollChange / startingBankroll) * 100).toFixed(1);
  const hasSpread = legs.length > 0;

  const handlePlaceTrade = () => {
    if (!hasSpread) return;
    const warning = placeTrade(ticker, legs, currentDay, currentPrice, pricePath);
    if (warning) {
      // Warning is shown via RiskWarning component — trade is still placed
    }
  };

  // Compute unrealized P/L for open positions using each trade's own price path
  const unrealizedPnL = openPositions.reduce((sum, trade) => {
    const r = 0.05;
    const clampedDay = Math.max(0, Math.min(currentDay, trade.pricePath.bars.length - 1));
    const tradePrice = trade.pricePath.bars[clampedDay]!.close;
    const avgDTE = trade.spread.legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / trade.spread.legs.length;
    const elapsed = currentDay - trade.entryDay;
    const T = Math.max(0, (avgDTE - elapsed) / 252);
    const pnl = spreadPnLAtPrice(trade.spread.legs, tradePrice, T, r);
    return sum + pnl;
  }, 0);

  return (
    <div className="space-y-4">
      {/* Bankroll card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Paper Pilot
          </h3>
          <button
            onClick={resetPortfolio}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Bankroll */}
        <div className="text-center mb-3">
          <div className="text-2xl font-bold text-slate-100">
            ${bankroll.toFixed(0)}
          </div>
          <div
            className={`text-sm font-medium ${
              bankrollChange >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {bankrollChange >= 0 ? "+" : ""}${bankrollChange.toFixed(0)} ({bankrollPct}%)
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-800/50 rounded-lg py-2">
            <div className="text-slate-500">Open</div>
            <div className="text-slate-200 font-semibold">
              {openPositions.length}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg py-2">
            <div className="text-slate-500">Unrealized</div>
            <div
              className={`font-semibold ${
                unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {unrealizedPnL >= 0 ? "+" : ""}${unrealizedPnL.toFixed(0)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg py-2">
            <div className="text-slate-500">Realized</div>
            <div
              className={`font-semibold ${
                totalPnL >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(0)}
            </div>
          </div>
        </div>
      </div>

      {/* Expiration danger zone */}
      <ExpirationWarning />

      {/* Risk warnings */}
      <RiskWarning />

      {/* Place trade button */}
      {hasSpread && (
        <Button
          variant="success"
          className="w-full py-3 text-sm"
          onClick={handlePlaceTrade}
          disabled={
            (!isFinite(maxLoss) && bankroll < 1000) ||
            (netDebit > 0 && netDebit > bankroll) ||
            bankroll <= 0
          }
        >
          {bankroll <= 0
            ? "Bankroll Depleted"
            : netDebit > 0 && netDebit > bankroll
              ? "Insufficient Bankroll"
              : `Place Trade — ${ticker} Spread`}
        </Button>
      )}

      {/* Open positions */}
      {openPositions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Open Positions
          </h3>
          <div className="space-y-2">
            {openPositions.map((trade) => (
              <OpenPositionCard
                key={trade.id}
                trade={trade}
                currentDay={currentDay}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trade log */}
      <TradeLog />
    </div>
  );
}

function OpenPositionCard({ trade, currentDay }: { trade: Trade; currentDay: number }) {
  const closeTrade = usePortfolioStore((s) => s.closeTrade);
  const [confirming, setConfirming] = useState(false);

  // Compute this trade's unrealized P/L
  const r = 0.05;
  const clampedDay = Math.max(0, Math.min(currentDay, trade.pricePath.bars.length - 1));
  const tradePrice = trade.pricePath.bars[clampedDay]!.close;
  const avgDTE = trade.spread.legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / trade.spread.legs.length;
  const elapsed = currentDay - trade.entryDay;
  const daysLeft = Math.max(0, Math.round(avgDTE - elapsed));
  const T = Math.max(0, (avgDTE - elapsed) / 252);
  const pnl = spreadPnLAtPrice(trade.spread.legs, tradePrice, T, r);

  const handleClose = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    closeTrade(trade.id, currentDay);
    setConfirming(false);
  };

  return (
    <div className="bg-slate-800/50 rounded-lg px-3 py-2.5 space-y-2">
      {/* Top row: ticker info + P/L */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-slate-300 font-semibold">{trade.ticker}</span>
          <span className="text-xs text-slate-500 ml-2">
            {trade.spread.legs.length} legs · {daysLeft}d left
          </span>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {pnl >= 0 ? "+" : ""}${pnl.toFixed(0)}
          </div>
          <div className="text-xs text-slate-500">
            Cost: ${Math.abs(trade.spread.netDebit).toFixed(0)}
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        onBlur={() => setConfirming(false)}
        className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
          confirming
            ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
            : "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
        }`}
      >
        {confirming
          ? `Confirm Close — ${pnl >= 0 ? "Lock in" : "Take"} ${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}`
          : "Close Position"}
      </button>
    </div>
  );
}
