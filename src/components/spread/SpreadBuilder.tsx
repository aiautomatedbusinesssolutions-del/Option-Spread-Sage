import { useSpreadStore } from "../../stores/spreadStore";
import { SpreadBlueprintLibrary } from "./SpreadBlueprintLibrary";
import { LegCard } from "./LegCard";
import { TugOfWarVisual } from "./TugOfWarVisual";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

export function SpreadBuilder() {
  const { legs, netDebit, maxProfit, maxLoss, breakevens, clearSpread } =
    useSpreadStore();

  const hasSpread = legs.length > 0;

  return (
    <div className="space-y-4">
      {/* Blueprint library */}
      <SpreadBlueprintLibrary />

      {/* Active spread */}
      {hasSpread && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">
              Active Spread
            </h3>
            <button
              onClick={clearSpread}
              className="text-xs text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          {/* Legs */}
          <div className="space-y-1.5">
            {legs.map((leg, i) => (
              <LegCard key={i} leg={leg} />
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500">
                <Tooltip text={translate("net cost") ?? ""}>Net Cost</Tooltip>
              </div>
              <div
                className={
                  netDebit >= 0 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"
                }
              >
                {netDebit >= 0
                  ? `-$${netDebit.toFixed(0)}`
                  : `+$${Math.abs(netDebit).toFixed(0)}`}
              </div>
              <div className="text-xs text-slate-600">
                {netDebit >= 0 ? "Debit" : "Credit"}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500">
                <Tooltip text={translate("max profit") ?? ""}>Max Profit</Tooltip>
              </div>
              <div className="text-emerald-400 font-semibold">
                {isFinite(maxProfit)
                  ? `$${maxProfit.toFixed(0)}`
                  : "Unlimited"}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500">
                <Tooltip text={translate("max loss") ?? ""}>Max Loss</Tooltip>
              </div>
              <div className="text-rose-400 font-semibold">
                {isFinite(maxLoss)
                  ? `-$${Math.abs(maxLoss).toFixed(0)}`
                  : "Unlimited"}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg px-3 py-2">
              <div className="text-xs text-slate-500">
                <Tooltip text={translate("breakeven") ?? ""}>Breakeven</Tooltip>
              </div>
              <div className="text-sky-400 font-semibold">
                {breakevens.length > 0
                  ? breakevens.map((b) => `$${b.toFixed(0)}`).join(", ")
                  : "—"}
              </div>
            </div>
          </div>

          {/* Tug of war */}
          <TugOfWarVisual legs={legs} />
        </div>
      )}
    </div>
  );
}
