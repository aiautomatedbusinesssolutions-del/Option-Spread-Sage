/**
 * Black-Scholes Option Pricing Engine (with continuous dividends)
 *
 * S     = Current stock price
 * K     = Strike price
 * T     = Time to expiration (in years)
 * r     = Risk-free interest rate (e.g. 0.05 for 5%)
 * sigma = Implied volatility (e.g. 0.30 for 30%)
 * q     = Continuous dividend yield (e.g. 0.02 for 2%)
 */

// --- Cumulative Normal Distribution ---
// Uses A&S 7.1.26 erfc coefficients with the x/√2 transform:
// Φ(x) = 0.5 * (1 + erf(x/√2)), where erfc is approximated by the rational polynomial.

export function normCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  // erfc coefficients require evaluation at |x|/√2
  const t = 1.0 / (1.0 + p * absX / Math.SQRT2);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp((-absX * absX) / 2);

  return 0.5 * (1.0 + sign * y);
}

// --- Standard Normal PDF ---

export function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// --- d1 and d2 helper ---

function d1d2(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number = 0
) {
  if (sigma <= 0) {
    const intrinsic = S > K ? 1e10 : S === K ? 0 : -1e10;
    return { d1: intrinsic, d2: intrinsic };
  }
  const sqrtT = Math.sqrt(T);
  const d1 =
    (Math.log(S / K) + (r - q + (sigma * sigma) / 2) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  return { d1, d2 };
}

// --- Option Prices ---

export function callPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number = 0
): number {
  if (T <= 0) return Math.max(S - K, 0);
  const { d1, d2 } = d1d2(S, K, T, r, sigma, q);
  return (
    S * Math.exp(-q * T) * normCDF(d1) -
    K * Math.exp(-r * T) * normCDF(d2)
  );
}

export function putPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number = 0
): number {
  if (T <= 0) return Math.max(K - S, 0);
  const { d1, d2 } = d1d2(S, K, T, r, sigma, q);
  return (
    K * Math.exp(-r * T) * normCDF(-d2) -
    S * Math.exp(-q * T) * normCDF(-d1)
  );
}

// --- Greeks ---

export function delta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put",
  q: number = 0
): number {
  if (T <= 0) return type === "call" ? (S > K ? 1 : 0) : S < K ? -1 : 0;
  const { d1 } = d1d2(S, K, T, r, sigma, q);
  const eqT = Math.exp(-q * T);
  return type === "call" ? eqT * normCDF(d1) : eqT * (normCDF(d1) - 1);
}

export function gamma(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number = 0
): number {
  if (T <= 0) return 0;
  const { d1 } = d1d2(S, K, T, r, sigma, q);
  return (Math.exp(-q * T) * normPDF(d1)) / (S * sigma * Math.sqrt(T));
}

export function theta(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put",
  q: number = 0
): number {
  if (T <= 0) return 0;
  const { d1, d2 } = d1d2(S, K, T, r, sigma, q);
  const sqrtT = Math.sqrt(T);
  const eqT = Math.exp(-q * T);
  const erT = Math.exp(-r * T);

  const common = -(S * eqT * normPDF(d1) * sigma) / (2 * sqrtT);

  if (type === "call") {
    return (
      (common +
        q * S * eqT * normCDF(d1) -
        r * K * erT * normCDF(d2)) /
      365
    );
  }
  return (
    (common -
      q * S * eqT * normCDF(-d1) +
      r * K * erT * normCDF(-d2)) /
    365
  );
}

export function vega(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  q: number = 0
): number {
  if (T <= 0) return 0;
  const { d1 } = d1d2(S, K, T, r, sigma, q);
  return (S * Math.exp(-q * T) * normPDF(d1) * Math.sqrt(T)) / 100;
}

export function rho(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put",
  q: number = 0
): number {
  if (T <= 0) return 0;
  const { d2 } = d1d2(S, K, T, r, sigma, q);
  const erT = Math.exp(-r * T);
  if (type === "call") {
    return (K * T * erT * normCDF(d2)) / 100;
  }
  return (-K * T * erT * normCDF(-d2)) / 100;
}

// --- Convenience: price an option by type ---

export function optionPrice(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put",
  q: number = 0
): number {
  return type === "call"
    ? callPrice(S, K, T, r, sigma, q)
    : putPrice(S, K, T, r, sigma, q);
}
