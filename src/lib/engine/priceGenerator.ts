import type { DailyBar, PricePath, ScenarioType, TickerProfile } from "../../types/market";
import { seededNormal } from "./seedrandom";
import { getScenarioConfig } from "../../data/scenarios";

const TRADING_DAYS = 63; // ~3 months of trading days

/**
 * Trend-dominant price generator for a learning simulator.
 *
 * The scenario MUST visually match what the user selected:
 *   Bull Rally  → price clearly goes UP
 *   Bear Crash  → price clearly goes DOWN
 *   Sideways    → price oscillates around start
 *   IV Crush    → small move, vol collapses mid-way
 *   Gradual Decay → slow grind down
 *
 * Uses a deterministic trend curve + small cosmetic noise so the
 * direction is guaranteed while still looking like a real chart.
 */
export function generatePricePath(
  ticker: TickerProfile,
  scenario: ScenarioType,
  seed: number
): PricePath {
  const config = getScenarioConfig(scenario);
  const normal = seededNormal(seed);

  const bars: DailyBar[] = [];
  const basePrice = ticker.basePrice;
  const totalMove = config.totalMovePercent;
  const noiseScale = config.dailyNoisePercent;

  // Build deterministic trend curve
  const trendValues: number[] = [];
  for (let day = 0; day < TRADING_DAYS; day++) {
    const t = day / (TRADING_DAYS - 1);
    trendValues.push(getTrendMultiplier(t, scenario, totalMove));
  }

  // Generate prices: trend + cosmetic noise
  let prevClose = basePrice;
  for (let day = 0; day < TRADING_DAYS; day++) {
    const trendPrice = basePrice * trendValues[day]!;

    const Z = normal();
    const noise = 1 + noiseScale * Z;
    const close = Math.max(trendPrice * noise, 0.01);

    const openNoise = 1 + noiseScale * 0.3 * normal();
    const open = Math.max(prevClose * openNoise, 0.01);

    const dayHigh = Math.max(open, close);
    const dayLow = Math.min(open, close);
    const extra = Math.abs(normal()) * Math.abs(close - open) * 0.25;
    const high = dayHigh + extra;
    const low = Math.max(dayLow - extra, 0.01);

    const baseVolume = 10_000_000;
    const volFactor = 1 + Math.abs(Z) * 0.5;
    const volume = Math.round(baseVolume * volFactor);

    bars.push({
      day,
      open: round2(open),
      high: round2(high),
      low: round2(low),
      close: round2(close),
      volume,
    });

    prevClose = close;
  }

  return { ticker, scenario, seed, bars };
}

/** Deterministic trend shape for each scenario. */
function getTrendMultiplier(
  t: number,
  scenario: ScenarioType,
  totalMove: number
): number {
  switch (scenario) {
    case "bull_rally":
      // Steady climb, slightly accelerating
      return 1 + totalMove * Math.pow(t, 0.8);
    case "bear_crash":
      // Fast initial drop that decelerates (panic pattern)
      return 1 + totalMove * Math.pow(t, 0.6);
    case "sideways":
      // Oscillate around start with a sine wave, net zero movement
      return 1 + 0.03 * Math.sin(t * Math.PI * 4);
    case "iv_crush":
      // Small upward drift — the real story is IV collapse
      return 1 + totalMove * t;
    case "gradual_decay":
      // Linear slow grind down
      return 1 + totalMove * t;
    default:
      return 1;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
