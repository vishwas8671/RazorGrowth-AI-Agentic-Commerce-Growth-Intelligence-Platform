import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Users, 
  ShoppingBag,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid, Legend 
} from 'recharts';
import type { DashboardMetrics } from '../types';
import type { TabType } from './Sidebar';

interface OverviewTabProps {
  metrics: DashboardMetrics | null;
  onNavigate: (tab: TabType) => void;
  onRunAnalysis: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  metrics,
  onNavigate,
  onRunAnalysis,
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* Prominent AI Growth Agent Banner                     */}
      {/* ---------------------------------------------------- */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden border border-blue-700">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>AI Growth Agent Intelligence</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              AI analyzed your store and detected <span className="text-emerald-400">{formatCurrency(metrics.total_growth_opportunity)}</span> in high-impact opportunities
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              5 autonomous growth playbooks generated: ₹2.7L recoverable failed payments, ₹1.8L VIP churn win-back, and ₹1.6L cross-sell bundling.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigate('opportunities')}
              className="px-4 py-2.5 rounded-lg bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors shadow-sm flex items-center space-x-2"
            >
              <span>Review Opportunities</span>
              <ArrowRight className="h-4 w-4 text-blue-700" />
            </button>
            <button
              onClick={onRunAnalysis}
              className="px-4 py-2.5 rounded-lg bg-blue-700/80 hover:bg-blue-600 border border-blue-500 text-white font-semibold text-xs transition-colors"
            >
              Run Real-time Agent Graph
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Key KPI Cards Grid                                   */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: GMV */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Gross Merchandise (GMV)</span>
            <ShoppingBag className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(metrics.gmv)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Across 5,000+ orders</div>
        </div>

        {/* Card 2: Net Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Net Settled Revenue</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{formatCurrency(metrics.revenue)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">AOV: ₹{metrics.aov.toFixed(0)}</div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Payment Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.success_rate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Fail Rate: <span className="text-rose-600 font-medium">{metrics.failure_rate}%</span>
          </div>
        </div>

        {/* Card 4: Potential Recovery */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Potential Recovery</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700">{formatCurrency(metrics.potential_recovery)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-semibold text-slate-700">{metrics.recoverable_count}</span> recoverable drop-offs
          </div>
        </div>

        {/* Card 5: Revenue at Risk */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Revenue at Risk</span>
            <ShieldAlert className="h-4 w-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-600">{formatCurrency(metrics.revenue_at_risk)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            Churn Rate: <span className="font-medium text-rose-600">{metrics.churn_rate}%</span>
          </div>
        </div>

        {/* Card 6: Total AI Growth Opportunity */}
        <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
            <span>AI Growth Opportunity</span>
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-blue-800">{formatCurrency(metrics.total_growth_opportunity)}</div>
          <div className="text-[11px] text-blue-700 mt-1 font-medium">5 Actionable Playbooks</div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Charts Grid: Monthly Revenue & Segments              */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend Area Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue & Leakage Velocity</h3>
              <p className="text-xs text-slate-500">6-Month monthly volume breakdown</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Successful</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
                <span className="text-slate-600">Failed Volume</span>
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis 
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  stroke="#cbd5e1" 
                />
                <Tooltip 
                  formatter={(val: number | string | undefined) => [
                    val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0',
                    ''
                  ]} 
                />
                <Area type="monotone" dataKey="success_revenue" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.15} name="Settled Revenue" />
                <Area type="monotone" dataKey="failed_revenue" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="Failed Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Bar Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Customer Segments Revenue Contribution</h3>
              <p className="text-xs text-slate-500">RFM value distribution by customer tier</p>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All Segments →
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.segments}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="segment" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis 
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  stroke="#cbd5e1" 
                />
                <Tooltip 
                  formatter={(val: number | string | undefined) => [
                    val !== undefined ? `₹${Number(val).toLocaleString('en-IN')}` : '₹0',
                    'Revenue'
                  ]} 
                />
                <Bar dataKey="total_spend" fill="#059669" radius={[4, 4, 0, 0]} name="Total Spend" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Bottom Grid: Payment Methods & Top Products          */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Health */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Payment Gateway Channel Health</h3>
              <p className="text-xs text-slate-500">Method distribution & drop-off rates</p>
            </div>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Recover Failures →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.payment_methods.map((pm) => (
              <div key={pm.method} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{pm.method}</div>
                  <div className="text-[11px] text-slate-500">
                    {pm.total_count} attempts • ₹{(pm.volume / 100000).toFixed(2)}L
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${pm.failure_rate > 15 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {pm.failure_rate}% failure
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {pm.failed_count} failed
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top Revenue Generating Products</h3>
              <p className="text-xs text-slate-500">Best performers eligible for bundle cross-sell</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {metrics.top_products.slice(0, 5).map((prod) => (
              <div key={prod.product_id} className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">{prod.product_name}</div>
                  <div className="text-[11px] text-slate-500">
                    {prod.category} • ₹{prod.price.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-900">
                    ₹{(prod.revenue_generated / 100000).toFixed(2)}L
                  </div>
                  <div className="text-[11px] text-emerald-600 font-medium">
                    {prod.sales_count} units sold
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
