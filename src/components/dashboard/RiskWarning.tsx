import { useSpreadStore } from "../../stores/spreadStore";
import { usePortfolioStore } from "../../stores/portfolioStore";
import { useGreeks } from "../../hooks/useGreeks";

export function RiskWarning() {
  const { legs, maxLoss } = useSpreadStore();
  const bankroll = usePortfolioStore((s) => s.bankroll);
  const { probProfit } = useGreeks();

  if (legs.length === 0) return null;

  const warnings: { level: "danger" | "warning"; message: string }[] = [];

  // Unlimited risk
  if (!isFinite(maxLoss)) {
    warnings.push({
      level: "danger",
      message:
        "This spread has unlimited risk. One bad move could wipe out everything. Consider adding a protective leg.",
    });
  }

  // Max loss > 5% of bankroll
  if (isFinite(maxLoss) && Math.abs(maxLoss) > bankroll * 0.05) {
    const pct = ((Math.abs(maxLoss) / bankroll) * 100).toFixed(0);
    warnings.push({
      level: "danger",
      message: `This one trade could cost you ${pct}% of your bankroll. That's a lot to risk on a single bet.`,
    });
  }

  // Low probability
  if (probProfit > 0 && probProfit < 0.3) {
    const pct = (probProfit * 100).toFixed(0);
    warnings.push({
      level: "warning",
      message: `Only a ${pct}% chance of profit. That's closer to gambling than investing.`,
    });
  }

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={`rounded-lg px-3 py-2 text-sm ${
            w.level === "danger"
              ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
              : "bg-amber-500/10 border border-amber-500/30 text-amber-400"
          }`}
        >
          {w.level === "danger" ? "⚠ " : "⚡ "}
          {w.message}
        </div>
      ))}
    </div>
  );
}
