import type { OptionContract, ExpirationChain, OptionsChain, Greeks } from "../../types/options";
import {
  callPrice,
  putPrice,
  delta,
  gamma,
  theta,
  vega,
  rho,
} from "../math/black-scholes";
import { getIV, tickerIVParams } from "./ivSurface";

const RISK_FREE_RATE = 0.05;
const STRIKES_PER_SIDE = 10; // 10 above + ATM + 10 below = 21 strikes
const EXPIRATION_OFFSETS = [7, 14, 30, 45]; // DTE for 4 expirations

/**
 * Generate a full options chain from current price and day.
 * 21 strikes x 4 expirations x 2 types = 168 contracts.
 */
export function generateOptionsChain(
  spotPrice: number,
  currentDay: number,
  baseIV: number,
  dividendYield: number = 0
): OptionsChain {
  const ivParams = tickerIVParams(baseIV);
  const strikeStep = getStrikeStep(spotPrice);
  const atmStrike = Math.round(spotPrice / strikeStep) * strikeStep;

  const strikes: number[] = [];
  for (let i = -STRIKES_PER_SIDE; i <= STRIKES_PER_SIDE; i++) {
    strikes.push(round2(atmStrike + i * strikeStep));
  }

  const expirations: ExpirationChain[] = EXPIRATION_OFFSETS.map((dte) => {
    const expDay = currentDay + dte;
    const T = dte / 252; // trading days to years

    const calls: OptionContract[] = [];
    const puts: OptionContract[] = [];

    for (const strike of strikes) {
      const iv = getIV(strike, spotPrice, dte, ivParams);

      const callGreeks = computeGreeks(spotPrice, strike, T, iv, "call", dividendYield);
      const putGreeks = computeGreeks(spotPrice, strike, T, iv, "put", dividendYield);

      calls.push({
        strike,
        type: "call",
        expiration: expDay,
        daysToExpiry: dte,
        price: round2(callPrice(spotPrice, strike, T, RISK_FREE_RATE, iv, dividendYield)),
        iv: round4(iv),
        greeks: callGreeks,
      });

      puts.push({
        strike,
        type: "put",
        expiration: expDay,
        daysToExpiry: dte,
        price: round2(putPrice(spotPrice, strike, T, RISK_FREE_RATE, iv, dividendYield)),
        iv: round4(iv),
        greeks: putGreeks,
      });
    }

    return { expiration: expDay, daysToExpiry: dte, calls, puts };
  });

  return { underlyingPrice: spotPrice, currentDay, expirations };
}

function computeGreeks(
  S: number,
  K: number,
  T: number,
  iv: number,
  type: "call" | "put",
  q: number
): Greeks {
  return {
    delta: round4(delta(S, K, T, RISK_FREE_RATE, iv, type, q)),
    gamma: round4(gamma(S, K, T, RISK_FREE_RATE, iv, q)),
    theta: round4(theta(S, K, T, RISK_FREE_RATE, iv, type, q)),
    vega: round4(vega(S, K, T, RISK_FREE_RATE, iv, q)),
    rho: round4(rho(S, K, T, RISK_FREE_RATE, iv, type, q)),
  };
}

/**
 * Determine strike step based on price level (e.g., $1 for low-priced, $5 for high-priced).
 */
function getStrikeStep(price: number): number {
  if (price < 25) return 1;
  if (price < 100) return 2.5;
  if (price < 250) return 5;
  return 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
