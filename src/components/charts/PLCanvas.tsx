import { useMemo } from "react";
import { useSpreadStore } from "../../stores/spreadStore";
import { useSimulationStore } from "../../stores/simulationStore";
import { usePLCurve } from "../../hooks/usePLCurve";

const SVG_W = 600;
const SVG_H = 280;
const PAD = { top: 20, right: 50, bottom: 30, left: 60 };

export function PLCanvas() {
  const { legs, breakevens } = useSpreadStore();
  const { currentPrice, currentDay } = useSimulationStore();

  // Expiration P/L (T=0)
  const expirationCurve = usePLCurve(legs, currentPrice, 0);

  // Current-day P/L (use average DTE)
  const avgDTE = legs.length > 0
    ? legs.reduce((s, l) => s + l.contract.daysToExpiry, 0) / legs.length
    : 0;
  const T = Math.max(0, (avgDTE - currentDay) / 252);
  const todayCurve = usePLCurve(legs, currentPrice, T > 0 ? T : 0);

  const chartData = useMemo(() => {
    if (expirationCurve.length === 0) return null;

    const allPnl = [...expirationCurve, ...todayCurve].map((p) => p.pnl);
    const minPnl = Math.min(...allPnl);
    const maxPnl = Math.max(...allPnl);
    const pnlRange = maxPnl - minPnl || 1;
    const pnlPad = pnlRange * 0.1;

    const yMin = minPnl - pnlPad;
    const yMax = maxPnl + pnlPad;
    const xMin = expirationCurve[0]!.price;
    const xMax = expirationCurve[expirationCurve.length - 1]!.price;

    const chartW = SVG_W - PAD.left - PAD.right;
    const chartH = SVG_H - PAD.top - PAD.bottom;

    const toX = (price: number) =>
      PAD.left + ((price - xMin) / (xMax - xMin)) * chartW;
    const toY = (pnl: number) =>
      PAD.top + (1 - (pnl - yMin) / (yMax - yMin)) * chartH;

    const zeroY = toY(0);

    // Build expiration path
    const expPath = expirationCurve
      .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.price).toFixed(1)},${toY(p.pnl).toFixed(1)}`)
      .join(" ");

    // Build green/red fill areas (split at zero line)
    const greenParts: string[] = [];
    const redParts: string[] = [];

    for (let i = 0; i < expirationCurve.length - 1; i++) {
      const p1 = expirationCurve[i]!;
      const p2 = expirationCurve[i + 1]!;
      const x1 = toX(p1.price);
      const x2 = toX(p2.price);
      const y1 = toY(p1.pnl);
      const y2 = toY(p2.pnl);

      if (p1.pnl >= 0 && p2.pnl >= 0) {
        greenParts.push(`M${x1},${zeroY} L${x1},${y1} L${x2},${y2} L${x2},${zeroY} Z`);
      } else if (p1.pnl < 0 && p2.pnl < 0) {
        redParts.push(`M${x1},${zeroY} L${x1},${y1} L${x2},${y2} L${x2},${zeroY} Z`);
      } else {
        // Zero crossing — split the segment
        const frac = Math.abs(p1.pnl) / (Math.abs(p1.pnl) + Math.abs(p2.pnl));
        const xMid = x1 + frac * (x2 - x1);
        if (p1.pnl >= 0) {
          greenParts.push(`M${x1},${zeroY} L${x1},${y1} L${xMid},${zeroY} Z`);
          redParts.push(`M${xMid},${zeroY} L${x2},${y2} L${x2},${zeroY} Z`);
        } else {
          redParts.push(`M${x1},${zeroY} L${x1},${y1} L${xMid},${zeroY} Z`);
          greenParts.push(`M${xMid},${zeroY} L${x2},${y2} L${x2},${zeroY} Z`);
        }
      }
    }

    // Today curve path
    const todayPath = todayCurve
      .map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.price).toFixed(1)},${toY(p.pnl).toFixed(1)}`)
      .join(" ");

    // Ghost price line
    const ghostX = toX(currentPrice);

    // Current P/L at current price
    const currentPnlPoint = todayCurve.reduce((best, p) =>
      Math.abs(p.price - currentPrice) < Math.abs(best.price - currentPrice) ? p : best
    );

    // Y-axis labels
    const ySteps = 5;
    const yLabels: { y: number; label: string }[] = [];
    for (let i = 0; i <= ySteps; i++) {
      const pnl = yMin + ((yMax - yMin) * i) / ySteps;
      yLabels.push({ y: toY(pnl), label: `$${pnl.toFixed(0)}` });
    }

    // X-axis labels
    const xSteps = 5;
    const xLabels: { x: number; label: string }[] = [];
    for (let i = 0; i <= xSteps; i++) {
      const price = xMin + ((xMax - xMin) * i) / xSteps;
      xLabels.push({ x: toX(price), label: `$${price.toFixed(0)}` });
    }

    return {
      expPath,
      todayPath,
      greenFill: greenParts.join(" "),
      redFill: redParts.join(" "),
      ghostX,
      zeroY,
      currentPnlPoint,
      breakevens: breakevens.map((b) => ({
        x: toX(b),
        inRange: b >= xMin && b <= xMax,
      })),
      yLabels,
      xLabels,
      toX,
      toY,
    };
  }, [expirationCurve, todayCurve, currentPrice, breakevens]);

  if (legs.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-500 text-sm">
          Select a spread template to see the P/L diagram
        </p>
      </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Green fill (profit zones) */}
        <path d={chartData.greenFill} fill="rgba(52,211,153,0.15)" />

        {/* Red fill (loss zones) */}
        <path d={chartData.redFill} fill="rgba(251,113,133,0.15)" />

        {/* Zero line */}
        <line
          x1={PAD.left}
          y1={chartData.zeroY}
          x2={SVG_W - PAD.right}
          y2={chartData.zeroY}
          stroke="#334155"
          strokeWidth={1}
        />

        {/* Y-axis labels */}
        {chartData.yLabels.map((l, i) => (
          <text
            key={i}
            x={PAD.left - 6}
            y={l.y + 4}
            textAnchor="end"
            className="fill-slate-500"
            fontSize={10}
          >
            {l.label}
          </text>
        ))}

        {/* X-axis labels */}
        {chartData.xLabels.map((l, i) => (
          <text
            key={i}
            x={l.x}
            y={SVG_H - 6}
            textAnchor="middle"
            className="fill-slate-500"
            fontSize={10}
          >
            {l.label}
          </text>
        ))}

        {/* Expiration P/L curve */}
        <path
          d={chartData.expPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
        />

        {/* Today P/L curve */}
        <path
          d={chartData.todayPath}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={2}
          strokeDasharray="6,3"
        />

        {/* Breakeven markers */}
        {chartData.breakevens
          .filter((b) => b.inRange)
          .map((b, i) => (
            <g key={i}>
              <line
                x1={b.x}
                y1={chartData.zeroY - 8}
                x2={b.x}
                y2={chartData.zeroY + 8}
                stroke="#fbbf24"
                strokeWidth={2}
              />
              <circle cx={b.x} cy={chartData.zeroY} r={3} fill="#fbbf24" />
            </g>
          ))}

        {/* Ghost price line */}
        <line
          x1={chartData.ghostX}
          y1={PAD.top}
          x2={chartData.ghostX}
          y2={SVG_H - PAD.bottom}
          stroke="#38bdf8"
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.6}
        />

        {/* Current P/L dot */}
        <circle
          cx={chartData.ghostX}
          cy={chartData.toY(chartData.currentPnlPoint.pnl)}
          r={5}
          fill={chartData.currentPnlPoint.pnl >= 0 ? "#34d399" : "#fb7185"}
          stroke="#0f172a"
          strokeWidth={2}
        />

        {/* Current P/L label */}
        <text
          x={chartData.ghostX + 8}
          y={chartData.toY(chartData.currentPnlPoint.pnl) - 8}
          className={
            chartData.currentPnlPoint.pnl >= 0
              ? "fill-emerald-400"
              : "fill-rose-400"
          }
          fontSize={12}
          fontWeight="bold"
        >
          {chartData.currentPnlPoint.pnl >= 0 ? "+" : ""}
          ${chartData.currentPnlPoint.pnl.toFixed(0)}
        </text>

        {/* Legend */}
        <line x1={PAD.left + 4} y1={12} x2={PAD.left + 20} y2={12} stroke="#94a3b8" strokeWidth={2} />
        <text x={PAD.left + 24} y={15} className="fill-slate-500" fontSize={9}>
          At Expiration
        </text>
        <line
          x1={PAD.left + 110}
          y1={12}
          x2={PAD.left + 126}
          y2={12}
          stroke="#38bdf8"
          strokeWidth={2}
          strokeDasharray="4,2"
        />
        <text x={PAD.left + 130} y={15} className="fill-slate-500" fontSize={9}>
          Today
        </text>
      </svg>
    </div>
  );
}
