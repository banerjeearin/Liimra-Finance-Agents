'use client';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Metric {
  sku_id: string;
  gross_revenue: number;
  net_revenue: number;
  total_cogs: number;
  gross_profit: number;
  gross_margin_pct: number;
  contribution_margin: number;
  contribution_margin_pct: number;
}

interface DashboardProps {
  metrics: Metric[];
  simulatedMetrics?: Metric[] | null;
  summary: string;
  isLoading: boolean;
}

export default function Dashboard({ metrics, simulatedMetrics, summary, isLoading }: DashboardProps) {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-2xl mb-8 flex flex-col items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white/60">Fetching live Excel model calculations...</p>
      </div>
    );
  }

  // Calculate Aggregates
  const safeMetrics = metrics || [];
  const totalRevenue = safeMetrics.reduce((sum, m) => sum + (m.gross_revenue || 0), 0);
  const totalProfit = safeMetrics.reduce((sum, m) => sum + (m.gross_profit || 0), 0);
  const totalContribution = safeMetrics.reduce((sum, m) => sum + (m.contribution_margin || 0), 0);
  
  const simTotalRevenue = simulatedMetrics?.reduce((sum, m) => sum + (m.gross_revenue || 0), 0);
  const simTotalProfit = simulatedMetrics?.reduce((sum, m) => sum + (m.gross_profit || 0), 0);
  const simTotalContribution = simulatedMetrics?.reduce((sum, m) => sum + (m.contribution_margin || 0), 0);

  // Prepare chart data
  const chartData = safeMetrics.map((m, index) => {
    const sim = simulatedMetrics?.find(s => s.sku_id === m.sku_id);
    return {
      sku: m.sku_id ? (m.sku_id.split('-').pop() || m.sku_id) : `SKU ${index + 1}`, // Shorten SKU ID
      'Base Rev': Math.round(m.gross_revenue || 0),
      'Base Margin': Math.round(m.contribution_margin || 0),
      'Sim Rev': sim ? Math.round(sim.gross_revenue || 0) : undefined,
      'Sim Margin': sim ? Math.round(sim.contribution_margin || 0) : undefined,
    };
  });

  return (
    <div className="space-y-6 mb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Gross Revenue</p>
          <p className="text-2xl font-bold text-white mt-1">
            ₹{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {simTotalRevenue !== undefined && (
            <p className={`text-xs mt-1 ${simTotalRevenue >= totalRevenue ? 'text-emerald-400' : 'text-rose-400'}`}>
              Simulated: ₹{simTotalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({(((simTotalRevenue - totalRevenue) / totalRevenue) * 100).toFixed(1)}%)
            </p>
          )}
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Gross Profit</p>
          <p className="text-2xl font-bold text-white mt-1">
            ₹{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {simTotalProfit !== undefined && (
            <p className={`text-xs mt-1 ${simTotalProfit >= totalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              Simulated: ₹{simTotalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({(((simTotalProfit - totalProfit) / totalProfit) * 100).toFixed(1)}%)
            </p>
          )}
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">Contribution Margin</p>
          <p className="text-2xl font-bold text-primary-foreground mt-1">
            ₹{totalContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          {simTotalContribution !== undefined && (
            <p className={`text-xs mt-1 ${simTotalContribution >= totalContribution ? 'text-emerald-400' : 'text-rose-400'}`}>
              Simulated: ₹{simTotalContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({(((simTotalContribution - totalContribution) / totalContribution) * 100).toFixed(1)}%)
            </p>
          )}
        </div>
      </div>

      {/* Main Graph Panel */}
      <div className="glass-panel p-6 rounded-2xl transform transition-all hover:scale-[1.005] duration-300">
        <h2 className="text-xl font-bold mb-4 glow-text text-white">SKU-level Contribution vs Revenue</h2>
        
        <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-primary-foreground text-sm leading-relaxed">{summary}</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="sku" stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(20,20,30,0.95)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} 
                itemStyle={{ color: '#a78bfa' }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Base Rev" fill="#34d399" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="Base Margin" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              {simulatedMetrics && <Bar dataKey="Sim Rev" fill="#60a5fa" radius={[4, 4, 0, 0]} opacity={0.6} />}
              {simulatedMetrics && <Bar dataKey="Sim Margin" fill="#f43f5e" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
