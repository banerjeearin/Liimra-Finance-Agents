'use client';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import ChatInterface from '@/components/ChatInterface';
import ScenarioSimulator from '@/components/ScenarioSimulator';
import UnitEconomicsSheet from '@/components/UnitEconomicsSheet';

export default function Home() {
  const [metrics, setMetrics] = useState([]);
  const [simulatedMetrics, setSimulatedMetrics] = useState(null);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('http://localhost:8000/api/dashboard');
        if (!res.ok) throw new Error('Failed to load dashboard metrics');
        const data = await res.json();
        setMetrics(data.metrics || []);
        setSummary(data.summary || 'MTD insights loaded.');
      } catch (err) {
        console.error(err);
        setSummary('Error: Could not retrieve live data from the backend server.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const handleSimulate = async (params: { ad_spend_change_pct: number; fulfillment_change_pct: number }) => {
    setIsSimulating(true);
    try {
      const res = await fetch('http://localhost:8000/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_spend_change_pct: params.ad_spend_change_pct,
          fulfillment_change_pct: params.fulfillment_change_pct,
        }),
      });
      if (!res.ok) throw new Error('Simulation failed');
      const simulatedData = await res.json();
      setSimulatedMetrics(simulatedData);
    } catch (err) {
      console.error(err);
      alert('Simulation failed. Please check backend connection.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight glow-text mb-2 text-white">
            Liimra <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Fuse</span>
          </h1>
          <p className="text-white/60 text-lg">AI-Powered Unit Economics Platform</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Excel Live Sync
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            ● AI Agents Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dashboard & Scenario & Spreadsheet */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          <Dashboard 
            metrics={metrics} 
            simulatedMetrics={simulatedMetrics} 
            summary={summary} 
            isLoading={isLoading} 
          />
          
          <UnitEconomicsSheet 
            initialSkus={metrics} 
            onSkusChange={(updatedSkus) => {
              // Map updated input parameters back to metrics for instantaneous chart and aggregate calculations
              const updatedMetrics = updatedSkus.map(sku => {
                const net_revenue = sku.price - (sku.price * sku.marketplace_fee_pct);
                const gross_profit = net_revenue - sku.cogs;
                const gross_margin_pct = sku.price > 0 ? (gross_profit / sku.price) : 0;
                const contribution_margin = gross_profit - sku.fulfillment_cost - sku.ad_spend;
                const contribution_margin_pct = sku.price > 0 ? (contribution_margin / sku.price) : 0;
                
                return {
                  sku_id: sku.sku_id,
                  gross_revenue: sku.price,
                  net_revenue,
                  total_cogs: sku.cogs,
                  gross_profit,
                  gross_margin_pct,
                  contribution_margin,
                  contribution_margin_pct,
                  price: sku.price,
                  cogs: sku.cogs,
                  fulfillment_cost: sku.fulfillment_cost,
                  marketplace_fee_pct: sku.marketplace_fee_pct,
                  ad_spend: sku.ad_spend
                };
              });
              setMetrics(updatedMetrics);
            }}
          />
          
          <ScenarioSimulator 
            onSimulate={handleSimulate} 
            isSimulating={isSimulating} 
          />
        </div>

        {/* Right Column: AI Chat Orchestrator */}
        <div className="lg:col-span-1">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
