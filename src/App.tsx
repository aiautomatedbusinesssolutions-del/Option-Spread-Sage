import { Header } from "./components/layout/Header";
import { MainLayout } from "./components/layout/MainLayout";
import { TimeControls } from "./components/controls/TimeControls";
import { PriceChart } from "./components/charts/PriceChart";
import { Card } from "./components/ui/Card";

function SpreadPlaceholder() {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-400 mb-2">Spread Builder</h2>
      <p className="text-slate-500 text-sm">Coming in Phase 5</p>
    </Card>
  );
}

function DashboardPlaceholder() {
  return (
    <Card>
      <h2 className="text-sm font-semibold text-slate-400 mb-2">Dashboard</h2>
      <p className="text-slate-500 text-sm">Coming in Phase 8</p>
    </Card>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <MainLayout
        leftPanel={<SpreadPlaceholder />}
        centerPanel={
          <div className="flex flex-col gap-4">
            <PriceChart />
            <TimeControls />
          </div>
        }
        rightPanel={<DashboardPlaceholder />}
      />
    </div>
  );
}
