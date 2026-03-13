import { useSpreadStore } from "../../stores/spreadStore";
import { useSimulationStore } from "../../stores/simulationStore";
import { useGreeks } from "../../hooks/useGreeks";
import { spreadPnLAtPrice } from "../../lib/math/spreads";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

/**
 * Plain-English summary that constantly updates with the current spread state.
 * Tells the user what they're betting, what they can win/lose, and how time affects them.
 */
export function BottomLineSummary() {
  const { legs, ticker, entryDay, netDebit, maxProfit, maxLoss, breakevens } =
    useSpreadStore();
  const { currentPrice, currentDay } = useSimulationStore();
  const { theta, probProfit } = useGreeks();

  if (legs.length === 0) return null;

  // Determine spread direction
  const isDebit = netDebit >= 0;

  // Build the "bet" description by sampling actual payoff at extreme prices
  let betDescription: string;
  if (breakevens.length === 2) {
    // Range trade (iron condor, butterfly)
    betDescription = `${ticker} stays between $${breakevens[0]!.toFixed(0)} and $${breakevens[1]!.toFixed(0)}`;
  } else if (breakevens.length === 1) {
    // Directional trade — determine direction from actual payoff
    const highPnl = spreadPnLAtPrice(legs, currentPrice * 1.5, 0, 0.05);
    const lowPnl = spreadPnLAtPrice(legs, currentPrice * 0.5, 0, 0.05);
    const isBullish = highPnl > lowPnl;
    betDescription = isBullish
      ? `${ticker} stays above $${breakevens[0]!.toFixed(0)}`
      : `${ticker} drops below $${breakevens[0]!.toFixed(0)}`;
  } else {
    betDescription = `${ticker} moves in your favor`;
  }

  // Average DTE minus elapsed since spread was built
  const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
  const elapsed = currentDay - entryDay;
  const daysLeft = Math.max(0, Math.round(avgDTE - elapsed));

  // Cost/credit description
  const costStr = isDebit
    ? `You paid $${netDebit.toFixed(0)} to enter this trade`
    : `You collected $${Math.abs(netDebit).toFixed(0)} upfront`;

  // Max profit/loss
  const profitStr = isFinite(maxProfit)
    ? `$${maxProfit.toFixed(0)}`
    : "unlimited";
  const lossStr = isFinite(maxLoss)
    ? `$${Math.abs(maxLoss).toFixed(0)}`
    : "unlimited";

  // Theta impact
  const dailyDecay = Math.abs(theta * 100);
  const thetaStr =
    theta >= 0
      ? `Time is on your side — earning you $${dailyDecay.toFixed(0)}/day.`
      : `Time is working against you — costing $${dailyDecay.toFixed(0)}/day.`;

  // Probability
  const probPct = (probProfit * 100).toFixed(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        Bottom Line
      </h3>

      <p className="text-sm text-slate-200 leading-relaxed">
        You're betting{" "}
        <span className="text-sky-400 font-semibold">{betDescription}</span>{" "}
        within the next{" "}
        <Tooltip text={translate("dte") ?? ""}>
          <span className="text-sky-400 font-semibold">
            {daysLeft} trading day{daysLeft !== 1 ? "s" : ""}
          </span>
        </Tooltip>
        .
      </p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <div className="text-slate-500">
            <Tooltip text={translate("net cost") ?? ""}>
              {isDebit ? "Cost" : "Credit"}
            </Tooltip>
          </div>
          <div className={isDebit ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
            {costStr}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <div className="text-slate-500">
            <Tooltip text={translate("probability") ?? ""}>Win Chance</Tooltip>
          </div>
          <div
            className={`font-semibold ${
              probProfit >= 0.5
                ? "text-emerald-400"
                : probProfit >= 0.3
                  ? "text-amber-400"
                  : "text-rose-400"
            }`}
          >
            {probPct}%
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <div className="text-slate-500">
            <Tooltip text={translate("max profit") ?? ""}>Best Case</Tooltip>
          </div>
          <div className="text-emerald-400 font-semibold">+{profitStr}</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg px-3 py-2">
          <div className="text-slate-500">
            <Tooltip text={translate("max loss") ?? ""}>Worst Case</Tooltip>
          </div>
          <div className="text-rose-400 font-semibold">-{lossStr}</div>
        </div>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        <Tooltip text={translate("theta") ?? ""}>{thetaStr}</Tooltip>
      </p>
    </div>
  );
}
