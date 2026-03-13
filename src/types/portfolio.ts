import type { SpreadPosition } from "./options";
import type { PricePath } from "./market";

export interface Trade {
  id: string;
  ticker: string;
  spread: SpreadPosition;
  pricePath: PricePath;
  entryDay: number;
  entryPrice: number;
  exitDay: number | null;
  exitPrice: number | null;
  pnl: number | null;
  status: "open" | "closed" | "expired";
}

export interface Portfolio {
  bankroll: number;
  startingBankroll: number;
  openPositions: Trade[];
  tradeLog: Trade[];
  totalPnL: number;
}
