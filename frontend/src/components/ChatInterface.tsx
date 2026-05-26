'use client';
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the Liimra Fuse Orchestrator. How can I help you analyze your unit economics today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);
    
    // Mocking response delay
    setTimeout(() => {
      let reply = "I can definitely help with that. The UE Engine suggests we look closer at shipping anomalies.";
      if (input.toLowerCase().includes("scenario") || input.toLowerCase().includes("what if")) {
        reply = "I've invoked the Scenario Agent. Adjust the sliders in the Sandbox below to see the impact on contribution margin.";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="glass-panel rounded-2xl flex flex-col h-[500px] overflow-hidden">
      <div className="p-4 border-b border-white/10 bg-white/5">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <Bot className="text-primary w-5 h-5" /> Fuse Orchestrator
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Bot className="text-primary w-4 h-4" />
              </div>
            )}
            <div className={`p-3 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/5'}`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                 <User className="text-white w-4 h-4" />
               </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Bot className="text-primary w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-white/10 text-white rounded-tl-none border border-white/5 flex gap-1 items-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question about margins, SKUs, or run a simulation..."
            className="w-full bg-black/40 border border-white/10 rounded-full py-3 px-5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-white/30 transition-all"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-full hover:bg-primary/80 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
