import { useEffect, useRef } from "react";
import { useSimulationStore, type PlaybackSpeed } from "../../stores/simulationStore";
import { totalDays } from "../../lib/engine/simulation";
import { Button } from "../ui/Button";

const SPEED_OPTIONS: { label: string; value: PlaybackSpeed }[] = [
  { label: "1x", value: 1000 },
  { label: "2x", value: 500 },
  { label: "4x", value: 250 },
];

export function TimeControls() {
  const {
    currentDay,
    currentPrice,
    pricePath,
    playbackState,
    speed,
    rewind,
    stepBackDay,
    togglePlayback,
    stepForwardDay,
    stepForwardWeek,
    setSpeed,
  } = useSimulationStore();

  const intervalRef = useRef<number | null>(null);
  const maxDay = totalDays(pricePath) - 1;

  // Auto-advance when playing
  useEffect(() => {
    if (playbackState === "playing") {
      intervalRef.current = window.setInterval(() => {
        useSimulationStore.getState().stepForwardDay();
      }, speed);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playbackState, speed]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      {/* Day / Price readout */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-slate-400">
          Day <span className="text-slate-100 font-semibold">{currentDay}</span>
          <span className="text-slate-600 mx-1">/</span>
          <span className="text-slate-500">{maxDay}</span>
        </div>
        <div className="text-lg font-semibold text-slate-100">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      {/* Transport controls */}
      <div className="flex items-center gap-2 justify-center">
        <Button
          variant="neutral"
          className="px-3 py-1.5 text-sm"
          onClick={rewind}
          title="Rewind to start"
        >
          ⏮
        </Button>
        <Button
          variant="neutral"
          className="px-3 py-1.5 text-sm"
          onClick={stepBackDay}
          disabled={currentDay <= 0}
          title="Step back 1 day"
        >
          ◀
        </Button>
        <Button
          variant={playbackState === "playing" ? "warning" : "success"}
          className="px-4 py-1.5 text-sm"
          onClick={togglePlayback}
          title={playbackState === "playing" ? "Pause" : "Play"}
        >
          {playbackState === "playing" ? "⏸" : "▶"}
        </Button>
        <Button
          variant="neutral"
          className="px-3 py-1.5 text-sm"
          onClick={stepForwardDay}
          disabled={currentDay >= maxDay}
          title="Step forward 1 day"
        >
          ▶
        </Button>
        <Button
          variant="neutral"
          className="px-3 py-1.5 text-sm"
          onClick={stepForwardWeek}
          disabled={currentDay >= maxDay}
          title="Step forward 1 week (5 days)"
        >
          ⏭
        </Button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center gap-2 justify-center mt-3">
        <span className="text-xs text-slate-500">Speed:</span>
        {SPEED_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSpeed(opt.value)}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
              speed === opt.value
                ? "bg-sky-500/20 text-sky-400"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-500 transition-all duration-200"
          style={{ width: `${(currentDay / maxDay) * 100}%` }}
        />
      </div>
    </div>
  );
}
