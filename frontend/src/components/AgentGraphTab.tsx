import React, { useState, useEffect, useRef } from 'react';
import { 
  Workflow, 
  Play, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Database, 
  Users, 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  Zap, 
  Check, 
  AlertCircle,
  ArrowRight,
  Terminal
} from 'lucide-react';
import type { TabType } from './Sidebar';

interface AgentNode {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'IDLE' | 'WAITING' | 'RUNNING' | 'COMPLETED' | 'VERIFIED' | 'WAITING_FOR_APPROVAL';
  summary?: string;
  data?: any;
}

interface AgentGraphTabProps {
  onNavigate: (tab: TabType) => void;
  onRefreshMetrics: () => void;
}

export const AgentGraphTab: React.FC<AgentGraphTabProps> = ({
  onNavigate,
  onRefreshMetrics,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'RUNNING' | 'WAITING_APPROVAL' | 'COMPLETED'>('IDLE');
  const [streamLogs, setStreamLogs] = useState<{ timestamp: string; agent?: string; message: string; type: string }[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes] = useState<AgentNode[]>([
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      role: 'Coordinates complete graph workflow & state persistence',
      icon: Workflow,
      status: 'IDLE',
      summary: 'Ready to coordinate specialized agents'
    },
    {
      id: 'data_analyst',
      name: 'Data Analyst Agent',
      role: 'Profiles schema, missing values, anomalies & financial KPIs',
      icon: Database,
      status: 'IDLE',
      summary: 'Scans raw SQLite transactions & customer tables'
    },
    {
      id: 'customer_intel',
      name: 'Customer Intelligence Agent',
      role: 'RFM segmentation, LTV trajectory & ML churn scoring',
      icon: Users,
      status: 'IDLE',
      summary: 'Segments customers into 7 tiers and flags churn risks'
    },
    {
      id: 'revenue_opp',
      name: 'Revenue Opportunity Agent',
      role: 'Detects recoverable failed payments, cross-sells & leakage',
      icon: TrendingUp,
      status: 'IDLE',
      summary: 'Mines 327 recoverable payment drop-offs'
    },
    {
      id: 'growth_strategy',
      name: 'Growth Strategy Agent',
      role: 'Prioritizes opportunities by ROI & drafts multichannel playbooks',
      icon: Sparkles,
      status: 'IDLE',
      summary: 'Synthesizes 5 high-impact growth opportunities'
    },
    {
      id: 'forecasting',
      name: 'Forecasting Agent',
      role: 'Forecasts 30-day baseline vs agentic growth trajectory',
      icon: BarChart3,
      status: 'IDLE',
      summary: 'Simulates revenue curve & churn saved'
    },
    {
      id: 'fact_checker',
      name: 'Fact Checker Guardrail Agent',
      role: 'Validates AI claims against raw database to eliminate hallucination',
      icon: ShieldCheck,
      status: 'IDLE',
      summary: 'Deterministic mathematical reconciliation'
    },
    {
      id: 'action_agent',
      name: 'Action Agent',
      role: 'Converts approved opportunities into simulated execution',
      icon: Zap,
      status: 'IDLE',
      summary: 'Awaiting merchant authorization gate'
    }
  ]);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamLogs]);

  const runPipeline = () => {
    if (isRunning) return;
    setIsRunning(true);
    setPipelineState('RUNNING');
    setProgress(5);
    setStreamLogs([]);

    // Reset nodes to WAITING
    setNodes(prev => prev.map((node, idx) => ({
      ...node,
      status: idx === 0 ? 'RUNNING' : 'WAITING',
      summary: idx === 0 ? 'Evaluating merchant graph execution plan...' : 'Waiting for upstream dependencies...'
    })));

    const eventSource = new EventSource('/api/agent/analyze/stream');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const timeStr = new Date().toLocaleTimeString();

        if (data.event === 'pipeline_start') {
          setStreamLogs(prev => [...prev, {
            timestamp: timeStr,
            message: data.message,
            type: 'info'
          }]);
        } else if (data.event === 'agent_status') {
          setProgress(data.progress || 50);

          // Update logs
          setStreamLogs(prev => [...prev, {
            timestamp: timeStr,
            agent: data.agent,
            message: data.description,
            type: data.status === 'COMPLETED' ? 'success' : 'running'
          }]);

          // Update node state
          setNodes(prev => prev.map(node => {
            if (node.name.toLowerCase().includes(data.agent.toLowerCase().replace(' agent', '')) ||
                data.agent.toLowerCase().includes(node.name.toLowerCase())) {
              return {
                ...node,
                status: data.status,
                summary: data.description,
                data: data.data
              };
            }
            return node;
          }));
        } else if (data.event === 'pipeline_complete') {
          setProgress(100);
          setPipelineState('WAITING_APPROVAL');
          setIsRunning(false);

          setNodes(prev => prev.map(node => {
            if (node.id === 'action_agent') {
              return {
                ...node,
                status: 'WAITING_FOR_APPROVAL',
                summary: 'Pipeline paused: Waiting for merchant to review and approve growth opportunities.'
              };
            }
            if (node.id === 'fact_checker') {
              return { ...node, status: 'VERIFIED' };
            }
            return { ...node, status: 'COMPLETED' };
          }));

          setStreamLogs(prev => [...prev, {
            timestamp: timeStr,
            message: `✓ Pipeline complete: Found ${data.opportunities_count} opportunities totaling ₹${Number(data.total_growth_opportunity).toLocaleString('en-IN')}. Paused for merchant approval.`,
            type: 'warning'
          }]);

          onRefreshMetrics();
          eventSource.close();
        }
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
      setIsRunning(false);
    };
  };

  const getStatusBadge = (status: AgentNode['status']) => {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600 mr-1"></span>
            Running
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Check className="h-3 w-3 mr-0.5" />
            Completed
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="h-3 w-3 mr-0.5" />
            Guardrail Passed
          </span>
        );
      case 'WAITING_FOR_APPROVAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
            <Clock className="h-3 w-3 mr-0.5" />
            Merchant Approval Required
          </span>
        );
      case 'WAITING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
            Waiting
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Multi-Agent Orchestration Studio</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              LangGraph-Style Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visual execution of specialized growth agents streaming via Server-Sent Events (SSE).
          </p>
        </div>

        <button
          onClick={runPipeline}
          disabled={isRunning}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
        >
          <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Executing Agent Graph...' : 'Run Agent Growth Pipeline'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Graph Execution Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Human-in-the-loop Gate Alert */}
      {pipelineState === 'WAITING_APPROVAL' && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-amber-900">
                Human-in-the-Loop Gate: Merchant Approval Needed
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Fact Checker verified 5 growth opportunities totaling ₹7.4L. The Action Agent will only dispatch simulated campaigns once approved.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('opportunities')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5 flex-shrink-0"
          >
            <span>Review & Approve Actions</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* Visual Multi-Agent Node Graph Grid                   */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isNodeActive = node.status === 'RUNNING';
          const isCompleted = node.status === 'COMPLETED' || node.status === 'VERIFIED';
          
          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all ${
                isNodeActive
                  ? 'bg-blue-50/50 border-blue-400 shadow-md ring-1 ring-blue-400'
                  : isCompleted
                  ? 'bg-white border-slate-200 hover:border-slate-300'
                  : 'bg-white border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  isNodeActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                {getStatusBadge(node.status)}
              </div>

              <h4 className="text-xs font-bold text-slate-900 mb-1">{node.name}</h4>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-snug">{node.role}</p>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Output: </span>
                {node.summary || 'Awaiting trigger'}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Live Agent Terminal / Reasoning Stream               */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-200 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">Agent Reasoning & Execution Log Stream</span>
          </div>
          <span className="text-[11px] text-slate-500">SSE Event Stream • Port 8000</span>
        </div>

        <div className="h-60 overflow-y-auto space-y-2 pr-2">
          {streamLogs.length === 0 ? (
            <div className="text-slate-500 italic py-8 text-center">
              Agent execution logs will stream here in real time. Click "Run Agent Growth Pipeline" to begin.
            </div>
          ) : (
            streamLogs.map((log, idx) => (
              <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                {log.agent && (
                  <span className="text-blue-400 font-semibold select-none">[{log.agent}]</span>
                )}
                <span className={
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warning' ? 'text-amber-400 font-semibold' :
                  log.type === 'info' ? 'text-cyan-300' : 'text-slate-300'
                }>
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
