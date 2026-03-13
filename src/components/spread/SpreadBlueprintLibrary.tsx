import { spreadTemplates } from "../../data/spreadTemplates";
import { useSimulationStore } from "../../stores/simulationStore";
import { useSpreadStore } from "../../stores/spreadStore";

export function SpreadBlueprintLibrary() {
  const { chain, currentPrice, selectedTicker } = useSimulationStore();
  const setLegs = useSpreadStore((s) => s.setLegs);

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Spread Templates
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {spreadTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => {
              const legs = template.buildLegs(chain);
              if (legs) setLegs(legs, currentPrice, selectedTicker.symbol);
            }}
            className="text-left bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-lg p-3 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{template.icon}</span>
              <span className="text-sm font-medium text-slate-200">
                {template.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {template.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
