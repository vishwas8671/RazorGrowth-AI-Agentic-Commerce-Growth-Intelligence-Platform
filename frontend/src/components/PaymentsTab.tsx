import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ShieldAlert, 
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';
import type { DashboardMetrics } from '../types';
import type { TabType } from './Sidebar';

interface PaymentsTabProps {
  metrics: DashboardMetrics | null;
  onNavigate: (tab: TabType) => void;
  onTriggerRecoveryCampaign: () => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  metrics,
  onNavigate,
  onTriggerRecoveryCampaign,
}) => {
  const [failuresData, setFailuresData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoverableOnly, setRecoverableOnly] = useState(true);

  const fetchFailures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments/failures?recoverable_only=${recoverableOnly}`);
      const data = await res.json();
      setFailuresData(data);
    } catch (err) {
      console.error('Failed to fetch failures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFailures();
  }, [recoverableOnly]);

  const formatCurrency = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* Recovery Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-xl border border-slate-800 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span>High-Intent Revenue Leakage</span>
          </div>
          <h2 className="text-xl font-bold">
            {formatCurrency(metrics?.potential_recovery || 274300)} Potentially Recoverable Revenue
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Detected 327 transactions that failed due to temporary bank timeouts and OTP expiries. High checkout intent confirmed.
          </p>
        </div>

        <button
          onClick={onTriggerRecoveryCampaign}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition-all flex items-center space-x-2 flex-shrink-0"
        >
          <Zap className="h-4 w-4" />
          <span>Launch 1-Click Recovery Campaign</span>
        </button>
      </div>

      {/* Failure Reason Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Bank Gateway Timeouts</div>
          <div className="text-lg font-bold text-slate-900">~68% of Failures</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Temporary banking host unavailability. Highly responsive to smart retry links.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">OTP Delay / Expiry</div>
          <div className="text-lg font-bold text-slate-900">~24% of Failures</div>
          <p className="text-[11px] text-slate-500 mt-1">
            SMS telecom gateway latency. Recoverable via instant WhatsApp 1-click pay link.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 mb-1">Expected Recovery Rate</div>
          <div className="text-lg font-bold text-emerald-600">34.2% Benchmark</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Projected revenue return: <span className="font-bold text-slate-800">~₹93,800</span> net margin.
          </p>
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRecoverableOnly(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              recoverableOnly
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Recoverable Transactions Only (327)
          </button>
          <button
            onClick={() => setRecoverableOnly(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !recoverableOnly
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Failed Payments
          </button>
        </div>
      </div>

      {/* Failures Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Failed Transaction Telemetry Ledger
          </h3>
          <span className="text-xs text-slate-500">
            Total Value: <span className="font-bold text-blue-700">₹{failuresData?.total_amount?.toLocaleString('en-IN') || '0'}</span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Failure Reason</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Recovery Play</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : failuresData?.recent_failures?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No failed payments found.
                  </td>
                </tr>
              ) : (
                failuresData?.recent_failures?.map((item: any) => (
                  <tr key={item.payment_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {item.payment_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{item.customer_email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.product_name}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        {item.payment_method}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                        {item.failure_reason}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {item.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={onTriggerRecoveryCampaign}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        1-Click Pay Link →
                      </button>
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
