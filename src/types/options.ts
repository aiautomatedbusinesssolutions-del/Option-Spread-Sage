export interface Greeks {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionContract {
  strike: number;
  type: "call" | "put";
  expiration: number; // day index in the simulation
  daysToExpiry: number;
  price: number;
  iv: number;
  greeks: Greeks;
}

export interface ExpirationChain {
  expiration: number;
  daysToExpiry: number;
  calls: OptionContract[];
  puts: OptionContract[];
}

export interface OptionsChain {
  underlyingPrice: number;
  currentDay: number;
  expirations: ExpirationChain[];
}

export type SpreadDirection = "long" | "short";

export interface SpreadLeg {
  contract: OptionContract;
  direction: SpreadDirection;
  quantity: number;
}

export interface SpreadPosition {
  legs: SpreadLeg[];
  netDebit: number; // positive = debit, negative = credit
  maxProfit: number;
  maxLoss: number;
  breakevens: number[];
  netGreeks: Greeks;
}
