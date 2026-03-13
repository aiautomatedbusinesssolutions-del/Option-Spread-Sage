import { Gauge } from "../ui/Gauge";
import { Tooltip } from "../ui/Tooltip";
import { translate } from "../../data/translations";

interface ThetaGaugeProps {
  theta: number;
}

export function ThetaGauge({ theta }: ThetaGaugeProps) {
  // Theta is typically negative for long positions, positive for short
  // Normalize: -0.10 to +0.10 range mapped to 0-1
  const normalized = Math.max(0, Math.min(1, (theta + 0.1) / 0.2));
  const dollars = Math.abs(theta * 100);
  const color = theta >= 0 ? "emerald" : "rose";

  return (
    <div className="text-center">
      <div className="text-xs text-slate-500 mb-1">
        <Tooltip text={translate("theta") ?? ""}>Decay Gauge</Tooltip>
      </div>
      <Gauge
        value={normalized}
        label={`${theta >= 0 ? "+" : ""}${theta.toFixed(3)}`}
        color={color as "emerald" | "rose"}
      />
      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
        {theta >= 0
          ? `Time is earning you $${dollars.toFixed(0)} every day.`
          : `Time is eating $${dollars.toFixed(0)} of your profit every day.`}
      </p>
    </div>
  );
}
