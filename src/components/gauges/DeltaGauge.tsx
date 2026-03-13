import { Gauge } from "../ui/Gauge";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

interface DeltaGaugeProps {
  delta: number;
}

export function DeltaGauge({ delta }: DeltaGaugeProps) {
  // Delta ranges from -1 to 1; normalize to 0-1 for the gauge
  const normalized = (delta + 1) / 2;
  const dollars = Math.abs(delta * 100);
  const direction = delta >= 0 ? "up" : "down";
  const color = delta >= 0 ? "emerald" : "rose";

  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mb-1">
        <Tooltip text={translate("delta") ?? ""}>Move Gauge</Tooltip>
      </div>
      <Gauge
        value={normalized}
        label={delta.toFixed(2)}
        color={color as "emerald" | "rose"}
      />
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        If the stock moves {direction} $1, you{" "}
        {delta >= 0 ? "gain" : "lose"} about ${dollars.toFixed(0)}.
      </p>
    </div>
  );
}
