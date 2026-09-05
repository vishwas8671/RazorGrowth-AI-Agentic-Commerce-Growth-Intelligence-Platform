import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Database, 
  TrendingUp, 
  CreditCard, 
  Users, 
  HelpCircle,
  Wrench,
  CheckCircle2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  toolCalls?: { tool: string; result_summary: string }[];
}

export const CopilotTab: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      text: 'Hello! I am your Autonomous RazorGrowth Copilot. Ask me anything about your transaction metrics, failed payment recoveries, churn risks, or growth opportunities. Every response is dynamically grounded in your merchant database.',
      timestamp: 'Just now',
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How much revenue can we recover from failed payments?',
    'Which payment method has the highest failure rate?',
    'Who are my most valuable VIP customers at risk of churn?',
    'What products should I bundle together for cross-selling?',
    'Why did net revenue dip and what is the churn rate?'
  ];

  const handleSend = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: data.answer || 'Unable to analyze query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.tool_calls || [],
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: 'Sorry, I encountered an issue querying the database tools. Please ensure the backend is active.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Natural Language Business Copilot</h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
            Tool-Calling LLM Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ask questions in plain English. The agent inspects database tables, computes live metrics, and generates grounded growth intelligence.
        </p>

        {/* Quick Prompts */}
        <div className="mt-4 flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-slate-700 font-medium transition-colors text-left"
            >
              💬 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between text-[11px] opacity-70 mb-1">
                <span className="font-semibold">
                  {msg.sender === 'user' ? 'You (Merchant)' : 'RazorGrowth Copilot'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Tool Execution Badges */}
              {msg.toolCalls && msg.toolCalls.length > 0 && (
                <div className="space-y-1 py-1 border-b border-slate-200/60 my-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                    <Wrench className="h-3 w-3 text-blue-600" />
                    <span>Autonomous Tools Invoked:</span>
                  </div>
                  {msg.toolCalls.map((tc, i) => (
                    <div
                      key={i}
                      className="text-[11px] px-2 py-1 bg-white rounded border border-slate-200 text-slate-700 flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono font-semibold text-blue-700">{tc.tool}</span>
                      <span className="text-slate-400">•</span>
                      <span className="truncate">{tc.result_summary}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Content */}
              <div className="whitespace-pre-line font-sans text-xs">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-2 text-xs text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Copilot is querying database tools & synthesizing intelligence...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          placeholder="Ask a merchant intelligence question (e.g. What is our net revenue and churn rate?)..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 py-2.5 px-4 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
