import { useState, useRef, useEffect } from "react";
import { useSimulationStore } from "../../stores/simulationStore";
import { useSpreadStore } from "../../stores/spreadStore";
import { tickers } from "../../data/tickers";
import { getAllScenarios } from "../../data/scenarios";
import type { ScenarioType } from "../../types/market";

export function Header() {
  const { selectedTicker, selectedScenario, setTicker, setScenario } =
    useSimulationStore();
  const clearSpread = useSpreadStore((s) => s.clearSpread);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scenarios = getAllScenarios();

  const filteredTickers = searchQuery.trim()
    ? tickers.filter(
        (t) =>
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tickers;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* App title */}
        <h1 className="text-lg font-bold text-slate-100 shrink-0">
          Spread Sage
        </h1>

        {/* Ticker search */}
        <div className="relative flex-1 max-w-xs" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search ticker..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          {/* Active ticker badge */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-sky-400">
            {selectedTicker.symbol}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
              {filteredTickers.map((t) => (
                <button
                  key={t.symbol}
                  onClick={() => {
                    setTicker(t);
                    clearSpread();
                    setSearchQuery("");
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-700 transition-colors cursor-pointer ${
                    t.symbol === selectedTicker.symbol
                      ? "text-sky-400"
                      : "text-slate-300"
                  }`}
                >
                  <span className="font-semibold">{t.symbol}</span>
                  <span className="text-slate-500 ml-2">{t.name}</span>
                  <span className="text-slate-600 ml-2 text-xs">
                    ${t.basePrice}
                  </span>
                </button>
              ))}
              {filteredTickers.length === 0 && (
                <div className="px-3 py-2 text-sm text-slate-500">
                  No tickers found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scenario selector */}
        <select
          value={selectedScenario}
          onChange={(e) => {
            setScenario(e.target.value as ScenarioType);
            clearSpread();
          }}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          {scenarios.map((s) => (
            <option key={s.type} value={s.type}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
}
