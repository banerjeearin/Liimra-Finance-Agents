import Dashboard from '@/components/Dashboard';
import ChatInterface from '@/components/ChatInterface';
import ScenarioSimulator from '@/components/ScenarioSimulator';

export default function Home() {
  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto font-sans">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight glow-text mb-2 text-white">
          Liimra <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Fuse</span>
        </h1>
        <p className="text-white/60 text-lg">AI-Powered Unit Economics Platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Dashboard & Scenario */}
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          <Dashboard />
          <ScenarioSimulator />
        </div>

        {/* Right Column: AI Chat Orchestrator */}
        <div className="lg:col-span-1">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
