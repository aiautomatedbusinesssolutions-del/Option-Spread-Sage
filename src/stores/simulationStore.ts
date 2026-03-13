import { create } from "zustand";
import type { PricePath, ScenarioType, TickerProfile } from "../types/market";
import type { OptionsChain } from "../types/options";
import { generatePricePath } from "../lib/engine/priceGenerator";
import { stepToDay, totalDays } from "../lib/engine/simulation";
import { tickers } from "../data/tickers";

export type PlaybackState = "playing" | "paused";
export type PlaybackSpeed = 1000 | 500 | 250;

interface SimulationState {
  // Core state
  selectedTicker: TickerProfile;
  selectedScenario: ScenarioType;
  seed: number;
  pricePath: PricePath;
  currentDay: number;
  currentPrice: number;
  chain: OptionsChain;

  // Playback
  playbackState: PlaybackState;
  speed: PlaybackSpeed;

  // Actions
  setTicker: (ticker: TickerProfile) => void;
  setScenario: (scenario: ScenarioType) => void;
  stepForwardDay: () => void;
  stepForwardWeek: () => void;
  stepBackDay: () => void;
  rewind: () => void;
  togglePlayback: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}

function initSimulation(ticker: TickerProfile, scenario: ScenarioType, seed: number) {
  const pricePath = generatePricePath(ticker, scenario, seed);
  const { price, chain } = stepToDay(pricePath, 0);
  return { pricePath, currentDay: 0, currentPrice: price, chain };
}

const defaultTicker = tickers[0]!;
const defaultScenario: ScenarioType = "bull_rally";
const defaultSeed = 42;
const initial = initSimulation(defaultTicker, defaultScenario, defaultSeed);

export const useSimulationStore = create<SimulationState>((set, get) => ({
  selectedTicker: defaultTicker,
  selectedScenario: defaultScenario,
  seed: defaultSeed,
  pricePath: initial.pricePath,
  currentDay: initial.currentDay,
  currentPrice: initial.currentPrice,
  chain: initial.chain,
  playbackState: "paused",
  speed: 1000,

  setTicker: (ticker) => {
    const { selectedScenario, seed } = get();
    const sim = initSimulation(ticker, selectedScenario, seed);
    set({
      selectedTicker: ticker,
      ...sim,
      playbackState: "paused",
    });
  },

  setScenario: (scenario) => {
    const { selectedTicker, seed } = get();
    const sim = initSimulation(selectedTicker, scenario, seed);
    set({
      selectedScenario: scenario,
      ...sim,
      playbackState: "paused",
    });
  },

  stepForwardDay: () => {
    const { pricePath, currentDay } = get();
    const maxDay = totalDays(pricePath) - 1;
    if (currentDay >= maxDay) {
      set({ playbackState: "paused" });
      return;
    }
    const nextDay = currentDay + 1;
    const { price, chain } = stepToDay(pricePath, nextDay);
    set({ currentDay: nextDay, currentPrice: price, chain });
  },

  stepForwardWeek: () => {
    const { pricePath, currentDay } = get();
    const maxDay = totalDays(pricePath) - 1;
    const nextDay = Math.min(currentDay + 5, maxDay);
    const { price, chain } = stepToDay(pricePath, nextDay);
    set({
      currentDay: nextDay,
      currentPrice: price,
      chain,
      playbackState: nextDay >= maxDay ? "paused" : get().playbackState,
    });
  },

  stepBackDay: () => {
    const { pricePath, currentDay } = get();
    if (currentDay <= 0) return;
    const prevDay = currentDay - 1;
    const { price, chain } = stepToDay(pricePath, prevDay);
    set({ currentDay: prevDay, currentPrice: price, chain });
  },

  rewind: () => {
    const { pricePath } = get();
    const { price, chain } = stepToDay(pricePath, 0);
    set({ currentDay: 0, currentPrice: price, chain, playbackState: "paused" });
  },

  togglePlayback: () => {
    const { playbackState, pricePath, currentDay } = get();
    const maxDay = totalDays(pricePath) - 1;
    if (playbackState === "paused") {
      // If at end, rewind first
      if (currentDay >= maxDay) {
        const { price, chain } = stepToDay(pricePath, 0);
        set({ currentDay: 0, currentPrice: price, chain, playbackState: "playing" });
      } else {
        set({ playbackState: "playing" });
      }
    } else {
      set({ playbackState: "paused" });
    }
  },

  setSpeed: (speed) => set({ speed }),
}));
