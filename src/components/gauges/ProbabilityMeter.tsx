import { Gauge } from "../ui/Gauge";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

interface ProbabilityMeterProps {
  probability: number; // 0 to 1
}

export function ProbabilityMeter({ probability }: ProbabilityMeterProps) {
  const pct = (probability * 100).toFixed(0);
  const color: "emerald" | "amber" | "rose" =
    probability >= 0.5 ? "emerald" : probability >= 0.3 ? "amber" : "rose";

  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mb-1">
        <Tooltip text={translate("probability") ?? ""}>Profit Chance</Tooltip>
      </div>
      <Gauge value={probability} label={`${pct}%`} color={color} />
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        {probability >= 0.6
          ? "Odds are in your favor — but nothing is guaranteed."
          : probability >= 0.4
            ? "This is roughly a coin flip. Size your bet carefully."
            : "Low probability — you're paying for a big potential payoff."}
      </p>
    </div>
  );
}
