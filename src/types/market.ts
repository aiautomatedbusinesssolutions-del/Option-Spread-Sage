export interface TickerProfile {
  symbol: string;
  name: string;
  sector: string;
  basePrice: number;
  annualizedVol: number;
  dividendYield: number;
  beta: number;
}

export interface DailyBar {
  day: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PricePath {
  ticker: TickerProfile;
  scenario: ScenarioType;
  seed: number;
  bars: DailyBar[];
}

export type ScenarioType =
  | "bull_rally"
  | "bear_crash"
  | "sideways"
  | "iv_crush"
  | "gradual_decay";
