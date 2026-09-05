import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  ShieldCheck, 
  Building2, 
  Cpu, 
  Key, 
  CheckCircle2,
  Database
} from 'lucide-react';

interface SettingsTabProps {
  onReloadDemo: () => Promise<void>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onReloadDemo }) => {
  const [reloading, setReloading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleReset = async () => {
    setReloading(true);
    setStatusMsg(null);
    try {
      await onReloadDemo();
      setStatusMsg('Merchant data reloaded successfully: 1,000 customers & 5,000 transactions.');
    } catch (err) {
      setStatusMsg('Error reloading dataset.');
    } finally {
      setReloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">Platform Settings & Demo Controls</h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
            System Config
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Configure autonomous agent safety parameters, API keys, and demo merchant dataset.
        </p>
      </div>

      {statusMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Demo Controls Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <Database className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">1-Click Demo Merchant Environment</h3>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Instantly regenerate a comprehensive synthetic merchant dataset (1,000 customers, 5,000 transactions, 327 recoverable failed payments, churn scenarios, and cross-sell affinities). Perfect for full demo evaluations without requiring live Razorpay API keys.
        </p>

        <button
          onClick={handleReset}
          disabled={reloading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${reloading ? 'animate-spin' : ''}`} />
          <span>{reloading ? 'Resetting Database...' : 'Reload Demo Merchant Data'}</span>
        </button>
      </div>

      {/* Autonomous Guardrails Configuration */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Autonomous Agent Governance & Guardrails</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="font-semibold text-slate-800">Fact Checker Guardrail Threshold</div>
              <div className="text-[11px] text-slate-500">Require deterministic verification against raw SQLite data before presenting opportunities</div>
            </div>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              100% Strict Reconciliation
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="font-semibold text-slate-800">Minimum Agent Confidence Gate</div>
              <div className="text-[11px] text-slate-500">Suppress growth playbooks with statistical confidence below cutoff</div>
            </div>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200">
              ≥ 80.0% Confidence
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <div className="font-semibold text-slate-800">Human-in-the-Loop Approval Gate</div>
              <div className="text-[11px] text-slate-500">Always require merchant confirmation before simulating marketing dispatch</div>
            </div>
            <span className="font-bold text-slate-800 bg-slate-200 px-2 py-1 rounded">
              Enforced (Mandatory)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
