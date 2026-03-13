import type { SpreadLeg } from "../../types/options";

interface TugOfWarVisualProps {
  legs: SpreadLeg[];
}

export function TugOfWarVisual({ legs }: TugOfWarVisualProps) {
  if (legs.length === 0) return null;

  const longLegs = legs.filter((l) => l.direction === "long");
  const shortLegs = legs.filter((l) => l.direction === "short");

  const longTheta = longLegs.reduce(
    (sum, l) => sum + l.contract.greeks.theta * l.quantity * 100,
    0
  );
  const shortTheta = shortLegs.reduce(
    (sum, l) => sum + Math.abs(l.contract.greeks.theta) * l.quantity * 100,
    0
  );

  const netTheta = shortTheta + longTheta; // longTheta is negative for long options
  const isNetPositiveTheta = netTheta > 0;

  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <div className="text-xs text-slate-500 mb-2">Tug of War — Time Decay</div>
      <div className="flex items-center gap-2">
        {/* Long side (paying theta) */}
        <div className="flex-1 text-right">
          <div className="text-xs text-emerald-400 mb-1">
            Bought Legs
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden flex justify-end">
            <div
              className="h-full bg-emerald-500/50 rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.abs(longTheta) / (Math.abs(longTheta) + shortTheta + 0.01) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            −${Math.abs(longTheta).toFixed(0)}/day
          </div>
        </div>

        {/* Center indicator */}
        <div className={`text-lg ${isNetPositiveTheta ? "text-emerald-400" : "text-rose-400"}`}>
          {isNetPositiveTheta ? "←" : "→"}
        </div>

        {/* Short side (collecting theta) */}
        <div className="flex-1">
          <div className="text-xs text-rose-400 mb-1">
            Sold Legs
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500/50 rounded-full transition-all"
              style={{
                width: `${Math.min(100, shortTheta / (Math.abs(longTheta) + shortTheta + 0.01) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            +${shortTheta.toFixed(0)}/day
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400 mt-2 text-center">
        {isNetPositiveTheta
          ? "Time is on your side — you collect more rent than you pay."
          : "Time is working against you — your bought options decay faster."}
      </div>
    </div>
  );
}
