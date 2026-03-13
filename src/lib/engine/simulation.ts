import type { PricePath } from "../../types/market";
import type { OptionsChain } from "../../types/options";
import { generateOptionsChain } from "./optionsChain";
import { getScenarioConfig, type ScenarioConfig } from "../../data/scenarios";

/**
 * Apply the scenario's IV schedule to the ticker's base volatility.
 * Returns an adjusted baseIV for the given day within the simulation.
 */
function adjustedIV(
  baseIV: number,
  config: ScenarioConfig,
  day: number,
  totalDaysCount: number
): number {
  const progress = totalDaysCount > 1 ? day / (totalDaysCount - 1) : 0;

  switch (config.ivSchedule) {
    case "stable":
      return baseIV * config.volMultiplier;
    case "rising":
      // IV rises linearly from base to 1.6x over the period
      return baseIV * config.volMultiplier * (1 + 0.6 * progress);
    case "falling":
      // IV falls linearly from base to 0.6x over the period
      return baseIV * config.volMultiplier * (1 - 0.4 * progress);
    case "crush":
      // IV starts elevated (1.5x) then drops sharply in the first third
      return baseIV * config.volMultiplier * (progress < 0.33
        ? 1.5 - 1.0 * (progress / 0.33)
        : 0.5);
    case "spike_then_crush":
      // IV spikes to 2x in first 20%, then crushes back to 0.6x
      return baseIV * config.volMultiplier * (progress < 0.2
        ? 1 + 5 * progress
        : 2.0 - 1.4 * ((progress - 0.2) / 0.8));
  }
}

/**
 * Get the options chain for a specific day in the simulation.
 * Reads the price from the pre-generated path, then rebuilds the chain
 * with IV adjusted for the active scenario's schedule.
 */
export function stepToDay(
  pricePath: PricePath,
  day: number
): { price: number; chain: OptionsChain } {
  const clampedDay = Math.max(0, Math.min(day, pricePath.bars.length - 1));
  const bar = pricePath.bars[clampedDay]!;
  const price = bar.close;

  const config = getScenarioConfig(pricePath.scenario);
  const dayIV = adjustedIV(
    pricePath.ticker.annualizedVol,
    config,
    clampedDay,
    pricePath.bars.length
  );

  const chain = generateOptionsChain(
    price,
    clampedDay,
    dayIV,
    pricePath.ticker.dividendYield
  );

  return { price, chain };
}

/**
 * Total number of trading days in a price path.
 */
export function totalDays(pricePath: PricePath): number {
  return pricePath.bars.length;
}
