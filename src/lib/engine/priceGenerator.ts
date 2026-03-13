import type { DailyBar, PricePath, ScenarioType, TickerProfile } from "../../types/market";
import { seededNormal } from "./seedrandom";
import { getScenarioConfig } from "../../data/scenarios";

const TRADING_DAYS = 63; // ~3 months of trading days

/**
 * Generate a price path using Geometric Brownian Motion:
 * S(t+1) = S(t) * exp((mu - sigma^2/2)*dt + sigma*sqrt(dt)*Z)
 */
export function generatePricePath(
  ticker: TickerProfile,
  scenario: ScenarioType,
  seed: number
): PricePath {
  const config = getScenarioConfig(scenario);
  const normal = seededNormal(seed);

  const dt = 1 / 252; // one trading day
  const mu = config.annualDrift;
  const sigma = ticker.annualizedVol * config.volMultiplier;

  const bars: DailyBar[] = [];
  let price = ticker.basePrice;

  for (let day = 0; day < TRADING_DAYS; day++) {
    const Z = normal();
    const dailyReturn = Math.exp(
      (mu - (sigma * sigma) / 2) * dt + sigma * Math.sqrt(dt) * Z
    );
    const close = price * dailyReturn;

    // Generate intraday high/low using a fraction of the daily move
    const move = Math.abs(close - price);
    const extra = Math.abs(normal()) * move * 0.3;
    const high = Math.max(price, close) + extra;
    const low = Math.min(price, close) - extra;

    // Synthetic volume based on volatility
    const baseVolume = 10_000_000;
    const volFactor = 1 + Math.abs(Z) * 0.5;
    const volume = Math.round(baseVolume * volFactor);

    bars.push({
      day,
      open: round2(price),
      high: round2(high),
      low: round2(Math.max(low, 0.01)),
      close: round2(close),
      volume,
    });

    price = close;
  }

  return { ticker, scenario, seed, bars };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
