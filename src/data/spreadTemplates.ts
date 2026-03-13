import type { OptionsChain, SpreadLeg, ExpirationChain } from "../types/options";

export interface SpreadTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  buildLegs: (chain: OptionsChain) => SpreadLeg[] | null;
}

/**
 * Pick the expiration closest to 30 DTE.
 */
function pickExpiration(chain: OptionsChain): ExpirationChain | undefined {
  if (chain.expirations.length === 0) return undefined;
  return chain.expirations.reduce((best, exp) =>
    Math.abs(exp.daysToExpiry - 30) < Math.abs(best.daysToExpiry - 30) ? exp : best
  );
}

/**
 * Find the strike index closest to a target price in a sorted strike list.
 */
function closestStrikeIdx(
  contracts: { strike: number }[],
  target: number
): number {
  let best = 0;
  for (let i = 1; i < contracts.length; i++) {
    if (Math.abs(contracts[i]!.strike - target) < Math.abs(contracts[best]!.strike - target)) {
      best = i;
    }
  }
  return best;
}

export const spreadTemplates: SpreadTemplate[] = [
  {
    id: "bull_call",
    name: "Bull Call Spread",
    icon: "📈",
    description:
      "You're BUYING a cheaper call (betting stock goes up) and SELLING a more expensive call (to reduce your cost). Your max profit is capped, but so is your risk.",
    buildLegs: (chain) => {
      const exp = pickExpiration(chain);
      if (!exp || exp.calls.length < 3) return null;
      const atm = closestStrikeIdx(exp.calls, chain.underlyingPrice);
      const otm = Math.min(atm + 2, exp.calls.length - 1);
      return [
        { contract: exp.calls[atm]!, direction: "long", quantity: 1 },
        { contract: exp.calls[otm]!, direction: "short", quantity: 1 },
      ];
    },
  },
  {
    id: "bear_put",
    name: "Bear Put Spread",
    icon: "📉",
    description:
      "You're BUYING a higher put (betting stock goes down) and SELLING a lower put (to reduce your cost). You profit if the stock drops, with limited risk.",
    buildLegs: (chain) => {
      const exp = pickExpiration(chain);
      if (!exp || exp.puts.length < 3) return null;
      const atm = closestStrikeIdx(exp.puts, chain.underlyingPrice);
      const otm = Math.max(atm - 2, 0);
      return [
        { contract: exp.puts[atm]!, direction: "long", quantity: 1 },
        { contract: exp.puts[otm]!, direction: "short", quantity: 1 },
      ];
    },
  },
  {
    id: "iron_condor",
    name: "Iron Condor",
    icon: "🦅",
    description:
      "You're SELLING two options near the current price (collecting rent) and BUYING two options further away (as insurance). You profit if the stock stays still.",
    buildLegs: (chain) => {
      const exp = pickExpiration(chain);
      if (!exp || exp.calls.length < 5) return null;
      const atm = closestStrikeIdx(exp.calls, chain.underlyingPrice);
      const putSellIdx = Math.max(atm - 1, 0);
      const putBuyIdx = Math.max(atm - 3, 0);
      const callSellIdx = Math.min(atm + 1, exp.calls.length - 1);
      const callBuyIdx = Math.min(atm + 3, exp.calls.length - 1);
      return [
        { contract: exp.puts[putBuyIdx]!, direction: "long", quantity: 1 },
        { contract: exp.puts[putSellIdx]!, direction: "short", quantity: 1 },
        { contract: exp.calls[callSellIdx]!, direction: "short", quantity: 1 },
        { contract: exp.calls[callBuyIdx]!, direction: "long", quantity: 1 },
      ];
    },
  },
  {
    id: "butterfly",
    name: "Butterfly Spread",
    icon: "🦋",
    description:
      "You're betting the stock lands right near the current price at expiration. Very low cost, high reward if you're exactly right, but low probability.",
    buildLegs: (chain) => {
      const exp = pickExpiration(chain);
      if (!exp || exp.calls.length < 5) return null;
      const atm = closestStrikeIdx(exp.calls, chain.underlyingPrice);
      const lower = Math.max(atm - 2, 0);
      const upper = Math.min(atm + 2, exp.calls.length - 1);
      return [
        { contract: exp.calls[lower]!, direction: "long", quantity: 1 },
        { contract: exp.calls[atm]!, direction: "short", quantity: 2 },
        { contract: exp.calls[upper]!, direction: "long", quantity: 1 },
      ];
    },
  },
  {
    id: "bull_put_credit",
    name: "Bull Put Credit Spread",
    icon: "💰",
    description:
      "You're SELLING a higher put and BUYING a lower put to collect premium upfront. You keep the credit if the stock stays above your sold strike.",
    buildLegs: (chain) => {
      const exp = pickExpiration(chain);
      if (!exp || exp.puts.length < 3) return null;
      const atm = closestStrikeIdx(exp.puts, chain.underlyingPrice);
      const sellIdx = Math.max(atm - 1, 0);
      const buyIdx = Math.max(atm - 3, 0);
      return [
        { contract: exp.puts[buyIdx]!, direction: "long", quantity: 1 },
        { contract: exp.puts[sellIdx]!, direction: "short", quantity: 1 },
      ];
    },
  },
];
