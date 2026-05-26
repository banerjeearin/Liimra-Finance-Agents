'use client';
import { useState } from 'react';
import { Sliders, TrendingUp } from 'lucide-react';

interface ScenarioSimulatorProps {
  onSimulate: (params: { ad_spend_change_pct: number; fulfillment_change_pct: number }) => void;
  isSimulating: boolean;
}

export default function ScenarioSimulator({ onSimulate, isSimulating }: ScenarioSimulatorProps) {
  const [adSpend, setAdSpend] = useState(0);
  const [shipping, setShipping] = useState(0);

  const handleSubmit = () => {
    onSimulate({
      ad_spend_change_pct: adSpend,
      fulfillment_change_pct: shipping,
    });
  };

  return (
    <div className="glass-panel p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sliders className="text-primary w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-white">What-If Sandbox</h2>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Ad Spend Adjustment (%)</span>
            <span className="font-mono text-primary">{adSpend > 0 ? '+' : ''}{adSpend}%</span>
          </div>
          <input 
            type="range" 
            min="-50" max="50" step="5"
            value={adSpend}
            onChange={(e) => setAdSpend(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span>Shipping Cost Adjustment (%)</span>
            <span className="font-mono text-primary">{shipping > 0 ? '+' : ''}{shipping}%</span>
          </div>
          <input 
            type="range" 
            min="-50" max="50" step="5"
            value={shipping}
            onChange={(e) => setShipping(parseInt(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSimulating}
          className="w-full py-3 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <TrendingUp className="w-4 h-4" /> {isSimulating ? 'Simulating...' : 'Run Simulation'}
        </button>
      </div>
    </div>
  );
}
