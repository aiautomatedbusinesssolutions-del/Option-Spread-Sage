import { useSpreadStore } from "../../stores/spreadStore";
import { useSimulationStore } from "../../stores/simulationStore";

export function ThetaDecayViz() {
  const { legs } = useSpreadStore();
  const { currentDay } = useSimulationStore();

  if (legs.length === 0) return null;

  const totalDailyDecay = legs.reduce((sum, leg) => {
    const sign = leg.direction === "long" ? 1 : -1;
    return sum + sign * leg.contract.greeks.theta * leg.quantity * 100;
  }, 0);

  const avgDTE = legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length;
  const remainingDTE = Math.max(0, Math.round(avgDTE - currentDay));
  const dteFraction = avgDTE > 0 ? Math.max(0, 1 - currentDay / avgDTE) : 0;

  // Theta accelerates near expiration — show as a curve
  const barSegments = 20;
  const segments = Array.from({ length: barSegments }, (_, i) => {
    const frac = i / barSegments;
    // Theta decays proportional to 1/sqrt(T), so acceleration near expiry
    const intensity = 1 / Math.sqrt(Math.max(0.05, 1 - frac));
    const isPast = frac < (1 - dteFraction);
    return { intensity, isPast };
  });

  const maxIntensity = Math.max(...segments.map((s) => s.intensity));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Theta Decay
        </h3>
        <div className="text-xs text-slate-400">
          {remainingDTE} days remaining
        </div>
      </div>

      {/* Decay acceleration bar */}
      <div className="flex gap-0.5 items-end h-10 mb-2">
        {segments.map((seg, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${(seg.intensity / maxIntensity) * 100}%`,
              backgroundColor: seg.isPast
                ? "rgba(251,113,133,0.4)"
                : "rgba(148,163,184,0.2)",
            }}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-slate-600">
        <span>Entry</span>
        <span>Expiration</span>
      </div>

      {/* Daily decay amount */}
      <div className="mt-3 text-center">
        <span className="text-xs text-slate-500">Daily time decay: </span>
        <span
          className={`text-sm font-semibold ${
            totalDailyDecay >= 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {totalDailyDecay >= 0 ? "+" : ""}${totalDailyDecay.toFixed(2)}
        </span>
      </div>
      <p className="text-xs text-slate-500 text-center mt-1">
        {totalDailyDecay >= 0
          ? "Time decay is earning you money each day."
          : `Time is eating $${Math.abs(totalDailyDecay).toFixed(0)} of your profit every day. The stock needs to move to stay ahead.`}
      </p>
    </div>
  );
}
