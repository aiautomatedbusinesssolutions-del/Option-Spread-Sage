import { Card } from "./components/ui/Card";
import { Button } from "./components/ui/Button";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">
          Option Spread Sage
        </h1>
        <p className="text-slate-400 mb-6">
          Learn how option spreads work through interactive simulation.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="success">Buy</Button>
          <Button variant="warning">Wait</Button>
          <Button variant="danger">Sell</Button>
          <Button variant="neutral">Info</Button>
        </div>
      </Card>
    </div>
  );
}
