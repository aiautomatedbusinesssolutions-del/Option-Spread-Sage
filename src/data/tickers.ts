import type { TickerProfile } from "../types/market";

export const tickers: TickerProfile[] = [
  { symbol: "AAPL",  name: "Apple",          sector: "Technology",      basePrice: 185, annualizedVol: 0.25, dividendYield: 0.005, beta: 1.2 },
  { symbol: "SPY",   name: "S&P 500 ETF",    sector: "Index",           basePrice: 520, annualizedVol: 0.15, dividendYield: 0.013, beta: 1.0 },
  { symbol: "NVDA",  name: "NVIDIA",          sector: "Technology",      basePrice: 875, annualizedVol: 0.50, dividendYield: 0.001, beta: 1.7 },
  { symbol: "TSLA",  name: "Tesla",           sector: "Auto",            basePrice: 175, annualizedVol: 0.55, dividendYield: 0.0,   beta: 2.0 },
  { symbol: "MSFT",  name: "Microsoft",       sector: "Technology",      basePrice: 420, annualizedVol: 0.22, dividendYield: 0.007, beta: 0.9 },
  { symbol: "AMZN",  name: "Amazon",          sector: "Technology",      basePrice: 185, annualizedVol: 0.30, dividendYield: 0.0,   beta: 1.3 },
  { symbol: "GOOGL", name: "Alphabet",        sector: "Technology",      basePrice: 155, annualizedVol: 0.28, dividendYield: 0.005, beta: 1.1 },
  { symbol: "META",  name: "Meta Platforms",   sector: "Technology",      basePrice: 510, annualizedVol: 0.35, dividendYield: 0.003, beta: 1.4 },
  { symbol: "AMD",   name: "AMD",             sector: "Technology",      basePrice: 165, annualizedVol: 0.45, dividendYield: 0.0,   beta: 1.6 },
  { symbol: "JPM",   name: "JPMorgan Chase",  sector: "Financials",      basePrice: 195, annualizedVol: 0.20, dividendYield: 0.023, beta: 1.1 },
  { symbol: "QQQ",   name: "Nasdaq 100 ETF",  sector: "Index",           basePrice: 440, annualizedVol: 0.20, dividendYield: 0.006, beta: 1.1 },
  { symbol: "IWM",   name: "Russell 2000 ETF",sector: "Index",           basePrice: 205, annualizedVol: 0.22, dividendYield: 0.012, beta: 1.0 },
  { symbol: "BA",    name: "Boeing",          sector: "Industrials",     basePrice: 195, annualizedVol: 0.38, dividendYield: 0.0,   beta: 1.5 },
  { symbol: "DIS",   name: "Walt Disney",     sector: "Entertainment",   basePrice: 115, annualizedVol: 0.30, dividendYield: 0.008, beta: 1.2 },
  { symbol: "COIN",  name: "Coinbase",        sector: "Crypto/Fintech",  basePrice: 225, annualizedVol: 0.65, dividendYield: 0.0,   beta: 2.5 },
];

export function getTickerBySymbol(symbol: string): TickerProfile | undefined {
  return tickers.find((t) => t.symbol === symbol.toUpperCase());
}
