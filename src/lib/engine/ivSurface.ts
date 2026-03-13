/**
 * IV Surface Generator
 *
 * Generates implied volatility with smile/skew effects:
 * iv(K) = baseIV * (1 + skew*(moneyness-1)^2 + put_skew*|min(0, moneyness-1)|)
 *
 * moneyness = K / S  (>1 = OTM call, <1 = OTM put)
 * OTM puts (moneyness < 1) get extra IV from the put skew term.
 */

export interface IVSurfaceParams {
  baseIV: number;
  smileSkew: number;   // curvature of the smile (typically 0.5-2.0)
  putSkew: number;     // extra skew for OTM puts (typically 0.1-0.5)
  termSlope: number;   // how IV changes with DTE (typically 0.001-0.005)
}

const DEFAULT_PARAMS: IVSurfaceParams = {
  baseIV: 0.30,
  smileSkew: 1.0,
  putSkew: 0.2,
  termSlope: 0.002,
};

/**
 * Calculate implied volatility for a specific strike and DTE.
 */
export function getIV(
  strike: number,
  spotPrice: number,
  dte: number,
  params: Partial<IVSurfaceParams> = {}
): number {
  const p = { ...DEFAULT_PARAMS, ...params };

  if (spotPrice <= 0) throw new Error(`Invalid spotPrice: ${spotPrice}`);
  if (dte < 0) throw new Error(`Invalid DTE: ${dte}`);
  if (p.baseIV <= 0) throw new Error(`Invalid baseIV: ${p.baseIV}`);

  const moneyness = strike / spotPrice;

  // Smile component: U-shaped around ATM
  const smileComponent = p.smileSkew * (moneyness - 1) ** 2;

  // Put skew: extra IV for OTM puts (moneyness < 1)
  // |min(0, m-1)| is positive when moneyness < 1, adding IV for OTM puts
  const putComponent = p.putSkew * Math.abs(Math.min(0, moneyness - 1));

  // Term structure: longer DTE slightly higher IV
  const termComponent = p.termSlope * Math.sqrt(dte);

  const iv = p.baseIV * (1 + smileComponent + putComponent) + termComponent;

  // Clamp only genuinely extreme but valid outputs
  return Math.max(0.05, Math.min(iv, 2.0));
}

/**
 * Generate IV params for a ticker profile.
 * Higher vol tickers get steeper smiles.
 */
export function tickerIVParams(baseIV: number): IVSurfaceParams {
  return {
    baseIV,
    smileSkew: 0.8 + baseIV * 1.5,
    putSkew: 0.15 + baseIV * 0.3,
    termSlope: 0.001 + baseIV * 0.005,
  };
}
