import { usePortfolioStore } from "../../stores/portfolioStore";

export function TradeLog() {
  const tradeLog = usePortfolioStore((s) => s.tradeLog);

  if (tradeLog.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-500 text-sm">No trades yet. Place your first trade above.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Trade History
      </h3>
      <div className="space-y-1.5">
        {[...tradeLog].reverse().map((trade) => {
          const isWin = trade.pnl !== null && trade.pnl > 0;
          const isLoss = trade.pnl !== null && trade.pnl < 0;
          return (
            <div
              key={trade.id}
              className="bg-slate-800/50 rounded-lg px-3 py-2 flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="text-sm text-slate-300">
                  <span className="font-semibold">{trade.ticker}</span>
                  <span className="text-slate-500 ml-2 text-xs">
                    {trade.spread.legs.length} legs
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Day {trade.entryDay}
                  {trade.exitDay !== null ? ` → ${trade.exitDay}` : ""}
                  <span className="ml-2">
                    {trade.status === "expired" ? "Expired" : "Closed"}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {trade.pnl !== null && (
                  <div
                    className={`text-sm font-semibold ${
                      isWin
                        ? "text-emerald-400"
                        : isLoss
                          ? "text-rose-400"
                          : "text-slate-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(0)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
