import { useGreeks } from "../../hooks/useGreeks";
import { useSpreadStore } from "../../stores/spreadStore";
import { DeltaGauge } from "./DeltaGauge";
import { ThetaGauge } from "./ThetaGauge";
import { VegaGauge } from "./VegaGauge";
import { ProbabilityMeter } from "./ProbabilityMeter";

export function GreekGauges() {
  const { legs } = useSpreadStore();
  const { delta, theta, vega, probProfit } = useGreeks();

  if (legs.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
        <p className="text-slate-500 text-sm">
          Build a spread to see the risk gauges
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Risk Gauges
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <DeltaGauge delta={delta} />
        <ThetaGauge theta={theta} />
        <VegaGauge vega={vega} />
        <ProbabilityMeter probability={probProfit} />
      </div>
    </div>
  );
}
