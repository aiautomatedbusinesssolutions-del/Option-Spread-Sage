import { Gauge } from "../ui/Gauge";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

interface VegaGaugeProps {
  vega: number;
}

export function VegaGauge({ vega }: VegaGaugeProps) {
  // Vega: normalize 0 to 0.3 range mapped to 0-1
  const normalized = Math.max(0, Math.min(1, Math.abs(vega) / 0.3));
  const dollars = Math.abs(vega * 100);
  const color = vega >= 0 ? "amber" : "sky";

  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mb-1">
        <Tooltip text={translate("vega") ?? ""}>Volatility Gauge</Tooltip>
      </div>
      <Gauge
        value={normalized}
        label={vega.toFixed(3)}
        color={color as "amber" | "sky"}
      />
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        {vega >= 0
          ? `If volatility rises 1%, you gain $${dollars.toFixed(0)}. If it drops, you lose $${dollars.toFixed(0)}.`
          : `If volatility drops 1%, you gain $${dollars.toFixed(0)}. If it rises, you lose $${dollars.toFixed(0)}.`}
      </p>
    </div>
  );
}
