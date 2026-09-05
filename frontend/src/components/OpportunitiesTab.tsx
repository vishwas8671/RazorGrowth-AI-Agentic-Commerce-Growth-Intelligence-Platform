import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  AlertCircle,
  Megaphone,
  Check,
  Eye
} from 'lucide-react';
import type { Opportunity } from '../types';
import type { TabType } from './Sidebar';

interface OpportunitiesTabProps {
  opportunities: Opportunity[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onSelectCampaignOpportunity: (opp: Opportunity) => void;
  onNavigate: (tab: TabType) => void;
}

export const OpportunitiesTab: React.FC<OpportunitiesTabProps> = ({
  opportunities,
  onApprove,
  onReject,
  onSelectCampaignOpportunity,
  onNavigate,
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Opportunity | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await onApprove(id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await onReject(id);
    } finally {
      setActionLoading(null);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'REVENUE_RECOVERY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Revenue Recovery</span>;
      case 'CHURN_PREVENTION':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Churn Prevention</span>;
      case 'CROSS_SELL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Cross-Sell Engine</span>;
      case 'UPSELL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">Bundle Upsell</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Growth Playbook</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">AI Growth Opportunities Hub</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              5 High-Impact Actions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Autonomous growth vectors discovered from transaction telemetry, payment gateway logs, and RFM intelligence.
          </p>
        </div>

        <button
          onClick={() => onNavigate('copilot')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
        >
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Ask Copilot about Opportunities</span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Opportunity Cards List                               */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-4">
        {opportunities.map((opp) => {
          const isPending = opp.status === 'PENDING_APPROVAL';
          const isApproved = opp.status === 'APPROVED';
          const isExecuted = opp.status === 'EXECUTED';

          return (
            <div
              key={opp.id}
              className={`bg-white rounded-xl border transition-all p-5 shadow-sm ${
                isApproved
                  ? 'border-emerald-300 ring-1 ring-emerald-200'
                  : isExecuted
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    {getCategoryBadge(opp.category)}
                    <span className="text-xs font-bold text-slate-400">{opp.id}</span>
                    {isApproved && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="h-3 w-3 mr-1" /> Approved by Merchant
                      </span>
                    )}
                    {isExecuted && (
                      <span className="inline-flex items-center text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <Sparkles className="h-3 w-3 mr-1" /> Executed (Demo Simulation)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{opp.title}</h3>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div className="text-xs text-slate-500">Estimated Revenue</div>
                    <div className="text-xl font-extrabold text-blue-700">
                      {formatCurrency(opp.estimated_revenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Confidence</div>
                    <div className="text-sm font-bold text-slate-800">
                      {(opp.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Root Cause & Evidence:</span>
                  <p className="text-slate-700 leading-relaxed">{opp.reason}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Target Audience:</span>
                  <div className="flex items-center space-x-1.5 text-slate-800 font-medium">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    <span>{opp.target_segment} ({opp.affected_customers} customers)</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Recommended Action:</span>
                  <p className="text-slate-700 leading-relaxed">{opp.recommended_action}</p>
                </div>
              </div>

              {/* Supporting Metrics Badges */}
              {opp.supporting_metrics && opp.supporting_metrics.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2 border-t border-slate-100">
                  {opp.supporting_metrics.map((m, idx) => (
                    <div key={idx} className="bg-slate-50 px-2.5 py-1 rounded text-[11px] border border-slate-200 text-slate-600">
                      <span className="text-slate-500">{m.metric}:</span> <span className="font-semibold text-slate-800">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  onClick={() => setSelectedAnalysis(opp)}
                  className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Full Evidence</span>
                </button>

                <div className="flex items-center space-x-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => handleReject(opp.id)}
                        disabled={actionLoading === opp.id}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 text-xs font-medium transition-colors"
                      >
                        Dismiss
                      </button>
                      <button
                        onClick={() => handleApprove(opp.id)}
                        disabled={actionLoading === opp.id}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Approve Action</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => onSelectCampaignOpportunity(opp)}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>Generate Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------------------------------------- */}
      {/* Evidence & Analysis Modal                            */}
      {/* ---------------------------------------------------- */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                {getCategoryBadge(selectedAnalysis.category)}
                <h3 className="font-bold text-slate-900 text-sm">{selectedAnalysis.title}</h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Reasoning Attribution</span>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  {selectedAnalysis.reason}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Quantitative Ledger Evidence</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Affected Customers:</span>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{selectedAnalysis.affected_customers}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500">Estimated Revenue:</span>
                    <div className="font-bold text-blue-700 text-sm mt-0.5">{formatCurrency(selectedAnalysis.estimated_revenue)}</div>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Supporting Metrics Checklist</span>
                <div className="space-y-1">
                  {selectedAnalysis.supporting_metrics?.map((m, idx) => (
                    <div key={idx} className="flex justify-between py-1.5 px-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-600">{m.metric}</span>
                      <span className="font-bold text-slate-900">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const opp = selectedAnalysis;
                  setSelectedAnalysis(null);
                  onSelectCampaignOpportunity(opp);
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-sm"
              >
                Proceed to Campaign Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
