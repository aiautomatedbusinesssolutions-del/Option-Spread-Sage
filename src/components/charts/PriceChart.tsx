import { useRef, useEffect, useCallback } from "react";
import { useSimulationStore } from "../../stores/simulationStore";

const CANDLE_UP = "#34d399";   // emerald-400
const CANDLE_DOWN = "#fb7185"; // rose-400
const GHOST_COLOR = "#38bdf8"; // sky-400
const GRID_COLOR = "#1e293b";  // slate-800
const LABEL_COLOR = "#94a3b8"; // slate-400
const BG_COLOR = "#0f172a";    // slate-900

const PADDING = { top: 24, right: 56, bottom: 28, left: 12 };

export function PriceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { pricePath, currentDay } = useSimulationStore();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Clear
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    const bars = pricePath.bars;
    const visibleBars = bars.slice(0, currentDay + 1);
    if (visibleBars.length === 0) return;

    // Calculate price range from ALL bars (keep chart scale stable)
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const bar of bars) {
      if (bar.low < minPrice) minPrice = bar.low;
      if (bar.high > maxPrice) maxPrice = bar.high;
    }
    const pricePad = (maxPrice - minPrice) * 0.08;
    minPrice -= pricePad;
    maxPrice += pricePad;

    const chartW = w - PADDING.left - PADDING.right;
    const chartH = h - PADDING.top - PADDING.bottom;
    const totalBars = bars.length;
    const candleWidth = Math.max(1, (chartW / totalBars) * 0.7);
    const candleGap = chartW / totalBars;

    // Helpers
    const priceToY = (p: number) =>
      PADDING.top + chartH * (1 - (p - minPrice) / (maxPrice - minPrice));
    const dayToX = (d: number) =>
      PADDING.left + candleGap * d + candleGap / 2;

    // Grid lines (horizontal)
    const gridSteps = 5;
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 1;
    ctx.font = "11px Inter, sans-serif";
    ctx.fillStyle = LABEL_COLOR;
    ctx.textAlign = "right";
    for (let i = 0; i <= gridSteps; i++) {
      const price = minPrice + ((maxPrice - minPrice) * i) / gridSteps;
      const y = priceToY(price);
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(w - PADDING.right, y);
      ctx.stroke();
      ctx.fillText(`$${price.toFixed(0)}`, w - 4, y + 4);
    }

    // Day labels (bottom)
    ctx.textAlign = "center";
    const labelEvery = Math.max(1, Math.floor(totalBars / 8));
    for (let d = 0; d < totalBars; d += labelEvery) {
      ctx.fillStyle = LABEL_COLOR;
      ctx.fillText(`D${d}`, dayToX(d), h - 6);
    }

    // Draw candles (only visible)
    for (const bar of visibleBars) {
      const x = dayToX(bar.day);
      const isUp = bar.close >= bar.open;
      const color = isUp ? CANDLE_UP : CANDLE_DOWN;

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, priceToY(bar.high));
      ctx.lineTo(x, priceToY(bar.low));
      ctx.stroke();

      // Body
      const bodyTop = priceToY(Math.max(bar.open, bar.close));
      const bodyBot = priceToY(Math.min(bar.open, bar.close));
      const bodyH = Math.max(1, bodyBot - bodyTop);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyH);
    }

    // Ghost line at current day
    const ghostX = dayToX(currentDay);
    ctx.strokeStyle = GHOST_COLOR;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ghostX, PADDING.top);
    ctx.lineTo(ghostX, h - PADDING.bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current price label on ghost line
    const currentBar = visibleBars[visibleBars.length - 1]!;
    const priceY = priceToY(currentBar.close);
    ctx.fillStyle = GHOST_COLOR;
    ctx.font = "bold 12px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`$${currentBar.close.toFixed(2)}`, ghostX + 6, priceY - 6);

    // Price dot
    ctx.beginPath();
    ctx.arc(ghostX, priceY, 4, 0, Math.PI * 2);
    ctx.fillStyle = GHOST_COLOR;
    ctx.fill();
  }, [pricePath, currentDay]);

  // Redraw on state change + resize
  useEffect(() => {
    draw();

    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden w-full"
      style={{ height: "320px" }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
