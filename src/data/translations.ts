/**
 * Jargon-to-plain-English dictionary for beginner tooltips.
 */
export const translations: Record<string, string> = {
  // Option basics
  strike:
    "The price the stock must reach for your option to pay off. Think of it as the target price.",
  expiration:
    "The deadline for your trade. After this date, your options disappear — win or lose.",
  dte:
    "Days to Expiry — how many trading days you have left before your options expire.",
  premium:
    "The price you pay (or receive) for an option. Like an insurance premium.",
  call:
    "A bet that the stock goes UP. You make money if the price rises above your strike.",
  put:
    "A bet that the stock goes DOWN. You make money if the price falls below your strike.",

  // Money-ness
  itm:
    "In The Money — your option already has value. A call is ITM when the stock is above the strike. A put is ITM when the stock is below.",
  otm:
    "Out of The Money — your option has no value yet. It needs the stock to move in your favor to pay off.",
  atm:
    "At The Money — the stock price is right at the strike price. It could go either way.",

  // Spread terms
  debit:
    "You paid money to open this trade. You need the trade to move in your favor to profit.",
  credit:
    "You collected money upfront when opening this trade. You profit if the stock stays in your range.",
  "net cost":
    "The total amount you paid (debit) or received (credit) to open this spread.",
  "max profit":
    "The most you can possibly make on this trade, no matter how far the stock moves.",
  "max loss":
    "The most you can possibly lose on this trade. This is your worst-case scenario.",
  breakeven:
    "The stock price where you neither win nor lose. Above this price you profit, below you lose (or vice versa).",
  spread:
    "A combination of options that limits both your risk and reward. Like buying insurance for your bet.",

  // Greeks
  delta:
    "How much your trade gains or loses when the stock moves $1. A delta of 0.50 means you gain $50 per $1 move up.",
  gamma:
    "How fast your delta changes. High gamma means your position is very sensitive to price moves right now.",
  theta:
    "How much money time is eating from (or adding to) your position every day. Negative theta = time is working against you.",
  vega:
    "How much your trade is affected by fear in the market. Rising volatility helps positive vega positions.",
  rho:
    "How much interest rates affect your trade. Usually a small factor — don't lose sleep over this one.",

  // Risk concepts
  "pin risk":
    "When the stock lands exactly at your strike at expiration. It's unclear whether your option will be exercised, creating uncertainty.",
  "iv crush":
    "When volatility drops suddenly (often after earnings). Option prices collapse even if the stock barely moves. Devastating for option buyers.",
  "unlimited risk":
    "This trade has no cap on how much you can lose. If the stock moves far enough against you, losses keep growing.",
  probability:
    "The chance your trade ends up profitable based on where the stock is now and how much time is left.",

  // Position terms
  long: "You bought this option. You want it to increase in value.",
  short: "You sold this option. You want it to decrease in value (or expire worthless).",
  "open position":
    "A trade that's still active — it hasn't expired or been closed yet.",
  bankroll:
    "Your total simulated trading capital. Think of it as your trading budget.",
};

/**
 * Look up a plain-English explanation for a jargon term.
 * Returns undefined if no translation exists.
 */
export function translate(term: string): string | undefined {
  return translations[term.toLowerCase()];
}

/**
 * All available jargon terms for tooltip scanning.
 */
export function allTerms(): string[] {
  return Object.keys(translations);
}
