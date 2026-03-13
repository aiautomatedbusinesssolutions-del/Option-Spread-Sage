import type { SpreadLeg } from "../../types/options";
import { useSpreadStore } from "../../stores/spreadStore";

interface LegCardProps {
  leg: SpreadLeg;
}

export function LegCard({ leg }: LegCardProps) {
  const ticker = useSpreadStore((s) => s.ticker);
  const isBuy = leg.direction === "long";
  const action = isBuy ? "BUY" : "SELL";
  const colorClass = isBuy ? "text-emerald-400" : "text-rose-400";
  const bgClass = isBuy ? "bg-emerald-500/10" : "bg-rose-500/10";
  const typeLabel = leg.contract.type === "call" ? "Call" : "Put";

  return (
    <div className={`${bgClass} rounded-lg px-3 py-2 flex items-center justify-between gap-2`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className={`text-xs font-bold ${colorClass}`}>{action}</span>
        <span className="text-slate-300 text-sm">
          {leg.quantity} {ticker} ${leg.contract.strike} {typeLabel}
        </span>
      </div>
      <span className="text-slate-400 text-sm shrink-0">
        @ ${leg.contract.price.toFixed(2)}
      </span>
    </div>
  );
}
