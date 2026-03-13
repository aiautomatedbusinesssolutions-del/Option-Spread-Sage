import type { SpreadPosition } from "./options";

export interface Trade {
  id: string;
  ticker: string;
  spread: SpreadPosition;
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
