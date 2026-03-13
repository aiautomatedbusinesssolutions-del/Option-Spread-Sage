import { usePortfolioStore } from "../../stores/portfolioStore";
import { useSimulationStore } from "../../stores/simulationStore";

/**
 * Danger zone alert when any open position is within 1 trading day of expiration.
 * Explains pin risk and time decay acceleration.
 */
export function ExpirationWarning() {
  const openPositions = usePortfolioStore((s) => s.openPositions);
  const currentDay = useSimulationStore((s) => s.currentDay);

  if (openPositions.length === 0) return null;

  // Find positions expiring within 1 day
  const expiringTrades = openPositions.filter((trade) => {
    const minExpiry = Math.min(
      ...trade.spread.legs.map((l) => l.contract.expiration)
    );
    const daysLeft = minExpiry - currentDay;
    return daysLeft <= 1 && daysLeft >= 0;
  });

  if (expiringTrades.length === 0) return null;

  const tickers = [...new Set(expiringTrades.map((t) => t.ticker))].join(", ");

  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-rose-400 text-lg">&#9888;</span>
        <h3 className="text-sm font-semibold text-rose-400">
          Expiration Danger Zone
        </h3>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">
        Your {tickers} position{expiringTrades.length > 1 ? "s are" : " is"}{" "}
        about to expire! In the last day before expiration:
      </p>
      <ul className="text-xs text-slate-400 space-y-1 ml-4 list-disc">
        <li>
          <span className="text-rose-400">Time decay accelerates</span> — theta
          eats your remaining value fastest in the final hours.
        </li>
        <li>
          <span className="text-amber-400">Pin risk</span> — if the stock lands
          near your strike, it's unclear whether your option gets exercised.
        </li>
        <li>
          <span className="text-slate-300">
            Most traders close before expiration
          </span>{" "}
          to avoid surprises.
        </li>
      </ul>
    </div>
  );
}
