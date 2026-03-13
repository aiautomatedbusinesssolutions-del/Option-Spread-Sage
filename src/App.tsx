import { Header } from "./components/layout/Header";
import { MainLayout } from "./components/layout/MainLayout";
import { TimeControls } from "./components/controls/TimeControls";
import { PriceChart } from "./components/charts/PriceChart";
import { PLCanvas } from "./components/charts/PLCanvas";
import { ThetaDecayViz } from "./components/charts/ThetaDecayViz";
import { SpreadBuilder } from "./components/spread/SpreadBuilder";
import { GreekGauges } from "./components/gauges/GreekGauges";
import { PaperPilotDashboard } from "./components/dashboard/PaperPilotDashboard";
import { BottomLineSummary } from "./components/alerts/BottomLineSummary";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Header />
      <MainLayout
        leftPanel={
          <div className="flex flex-col gap-4">
            <SpreadBuilder />
            <GreekGauges />
          </div>
        }
        centerPanel={
          <div className="flex flex-col gap-4">
            <PriceChart />
            <TimeControls />
            <BottomLineSummary />
            <PLCanvas />
            <ThetaDecayViz />
          </div>
        }
        rightPanel={<PaperPilotDashboard />}
      />
    </div>
  );
}
