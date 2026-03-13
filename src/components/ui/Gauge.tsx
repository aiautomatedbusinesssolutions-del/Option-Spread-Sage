interface GaugeProps {
  value: number;      // normalized 0-1 for arc position
  label: string;
  color: "emerald" | "amber" | "rose" | "sky";
  size?: number;
}

const COLOR_MAP = {
  emerald: { stroke: "#34d399", bg: "rgba(52,211,153,0.1)" },
  amber: { stroke: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  rose: { stroke: "#fb7185", bg: "rgba(251,113,133,0.1)" },
  sky: { stroke: "#38bdf8", bg: "rgba(56,189,248,0.1)" },
};

export function Gauge({ value, label, color, size = 100 }: GaugeProps) {
  const colors = COLOR_MAP[color];
  const clamped = Math.max(0, Math.min(1, value));

  // Semicircle geometry
  const cx = size / 2;
  const cy = size / 2 + 4;
  const r = size / 2 - 8;
  const startAngle = Math.PI;
  const endAngle = 0;
  const valueAngle = Math.PI - clamped * Math.PI;

  // Arc path helper
  const arcPoint = (angle: number) => ({
    x: cx + r * Math.cos(angle),
    y: cy - r * Math.sin(angle),
  });

  const bgStart = arcPoint(startAngle);
  const bgEnd = arcPoint(endAngle);
  const valEnd = arcPoint(valueAngle);

  // Background arc (full semicircle)
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Value arc (partial)
  const largeArc = clamped > 0.5 ? 1 : 0;
  const valPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 ${largeArc} 1 ${valEnd.x} ${valEnd.y}`;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 12} viewBox={`0 0 ${size} ${size / 2 + 12}`}>
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="#1e293b"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Value arc */}
        {clamped > 0.01 && (
          <path
            d={valPath}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={6}
            strokeLinecap="round"
          />
        )}
        {/* Center label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fill={colors.stroke}
          fontSize={14}
          fontWeight="bold"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
