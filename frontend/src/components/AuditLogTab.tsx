import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  ShieldCheck, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import type { AuditLogItem } from '../types';

export const AuditLogTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('ALL');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agents/activity');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const agentsList = [
    'ALL',
    'Orchestrator Agent',
    'Data Analyst Agent',
    'Customer Intelligence Agent',
    'Revenue Opportunity Agent',
    'Growth Strategy Agent',
    'Forecasting Agent',
    'Fact Checker Guardrail Agent',
    'Action Agent',
    'Merchant Governance'
  ];

  const filteredLogs = logs.filter((l) => {
    if (agentFilter === 'ALL') return true;
    return l.agent_name.toLowerCase().includes(agentFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Agent Governance & Audit Trail</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Enterprise Compliance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete immutable log of all autonomous evaluations, confidence metrics, human approvals, and simulated executions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Agent Filter Pills */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {agentsList.map((agent) => (
          <button
            key={agent}
            onClick={() => setAgentFilter(agent)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              agentFilter === agent
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Audit ID & Timestamp</th>
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-4">Action Taken</th>
                <th className="py-3 px-4">Input Telemetry</th>
                <th className="py-3 px-4">Output / Impact</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No audit records found matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{log.id}</div>
                      <div className="text-[11px] text-slate-400">{log.timestamp}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{log.agent_name}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={log.input_summary}>
                      {log.input_summary}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="text-slate-800 truncate" title={log.output_summary}>
                        {log.output_summary}
                      </div>
                      {log.estimated_impact > 0 && (
                        <div className="text-[11px] font-bold text-blue-700">
                          Impact: ₹{log.estimated_impact.toLocaleString('en-IN')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800">
                        {(log.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        log.human_approval === 'APPROVED' || log.human_approval === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.human_approval === 'REJECTED'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.human_approval}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
