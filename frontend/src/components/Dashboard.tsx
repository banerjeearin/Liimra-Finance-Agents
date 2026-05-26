'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState("Loading MTD insights...");

  useEffect(() => {
    // In a real app, fetch from /api/dashboard
    // Mocking for now to show the premium aesthetic
    const mockData = [
      { name: 'Week 1', profit: 4000, revenue: 24000 },
      { name: 'Week 2', profit: 3000, revenue: 13980 },
      { name: 'Week 3', profit: 2000, revenue: 9800 },
      { name: 'Week 4', profit: 2780, revenue: 39080 },
    ];
    setData(mockData);
    setSummary("Month-to-Date Summary: Generated $86,860 in Gross Revenue with a total Gross Profit of $11,780. Warning: Gross margins are slightly below target due to rising shipping costs.");
  }, []);

  return (
    <div className="glass-panel p-6 rounded-2xl mb-8 transform transition-all hover:scale-[1.01] duration-300">
      <h2 className="text-2xl font-bold mb-4 glow-text text-white">Month-to-Date Performance</h2>
      
      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
        <p className="text-primary-foreground text-sm leading-relaxed">{summary}</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
            <YAxis stroke="rgba(255,255,255,0.5)" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} 
              itemStyle={{ color: '#a78bfa' }}
            />
            <Line type="monotone" dataKey="profit" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
