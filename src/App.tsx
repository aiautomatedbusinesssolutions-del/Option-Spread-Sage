import { Header } from "./components/layout/Header";
import { MainLayout } from "./components/layout/MainLayout";
import { TimeControls } from "./components/controls/TimeControls";
import { PriceChart } from "./components/charts/PriceChart";
import { PLCanvas } from "./components/charts/PLCanvas";
import { ThetaDecayViz } from "./components/charts/ThetaDecayViz";
import { SpreadBuilder } from "./components/spread/SpreadBuilder";
import { Card } from "./components/ui/Card";

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
        leftPanel={<SpreadBuilder />}
        centerPanel={
          <div className="flex flex-col gap-4">
            <PriceChart />
            <TimeControls />
            <PLCanvas />
            <ThetaDecayViz />
          </div>
        }
        rightPanel={<DashboardPlaceholder />}
      />
    </div>
  );
}
