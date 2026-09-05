import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  ShoppingBag,
  ExternalLink,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Customer } from '../types';

export const CustomersTab: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [churnDetails, setChurnDetails] = useState<any | null>(null);
  const [loadingChurn, setLoadingChurn] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });
      if (segmentFilter !== 'ALL') params.append('segment', segmentFilter);
      if (riskFilter !== 'ALL') params.append('risk', riskFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [segmentFilter, riskFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCustomers();
  };

  const handleSelectCustomer = async (cust: Customer) => {
    setSelectedCustomer(cust);
    setLoadingChurn(true);
    try {
      const res = await fetch(`/api/customers/${cust.customer_id}/churn`);
      const data = await res.json();
      setChurnDetails(data);
    } catch (err) {
      console.error('Failed to fetch churn analysis:', err);
    } finally {
      setLoadingChurn(false);
    }
  };

  const segments = ['ALL', 'VIP', 'Loyal', 'Growing', 'At Risk', 'Churned', 'New', 'Price Sensitive'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">AI Customer Intelligence & Churn Radar</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              RFM & ML Scored
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive customer segmentation with Scikit-Learn churn scoring and explainable attribution reasons.
          </p>
        </div>
      </div>

      {/* Segment Filter Pills */}
      <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {segments.map((seg) => (
          <button
            key={seg}
            onClick={() => {
              setSegmentFilter(seg);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              segmentFilter === seg
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Search & Risk Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-medium">Risk Filter:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((rf) => (
            <button
              key={rf}
              onClick={() => {
                setRiskFilter(rf);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium border ${
                riskFilter === rf
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {rf}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Customers Table                                      */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Segment</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4">Churn Risk</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No customers found matching filter criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{c.city}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        c.segment === 'VIP' ? 'bg-amber-100 text-amber-800' :
                        c.segment === 'At Risk' ? 'bg-rose-100 text-rose-800' :
                        c.segment === 'Loyal' ? 'bg-blue-100 text-blue-800' :
                        c.segment === 'Churned' ? 'bg-slate-100 text-slate-600' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{c.total_orders}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{c.total_spend.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {c.last_purchase_date ? c.last_purchase_date.split(' ')[0] : 'Never'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${
                          c.churn_risk === 'HIGH' ? 'bg-rose-500' :
                          c.churn_risk === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></span>
                        <span className="font-semibold text-slate-800">{c.churn_risk}</span>
                        <span className="text-[11px] text-slate-400">
                          ({(c.churn_probability * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSelectCustomer(c)}
                        className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      >
                        ML Deep Dive →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
          <div>Page {page} of {totalPages}</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* ML Churn Analysis Modal                              */}
      {/* ---------------------------------------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  ML Churn Prediction: {selectedCustomer.name} ({selectedCustomer.customer_id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {loadingChurn ? (
              <div className="py-12 text-center text-slate-400">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-xs mt-2">Running Scikit-Learn churn inference...</p>
              </div>
            ) : churnDetails ? (
              <div className="space-y-4 text-xs">
                {/* Meter card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Churn Risk Rating</span>
                    <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                      {churnDetails.risk_level} RISK
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium">Probability</span>
                    <div className={`text-2xl font-black ${
                      churnDetails.churn_probability > 0.6 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {(churnDetails.churn_probability * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Explainable Reasons */}
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Attribution Drivers (Why this prediction?):
                  </span>
                  <div className="space-y-1.5">
                    {churnDetails.reasons?.map((r: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 p-2 bg-rose-50/60 border border-rose-100 rounded text-rose-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RFM Telemetry Features */}
                <div>
                  <span className="font-bold text-slate-800 block mb-1.5">Model Input Features</span>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Recency</span>
                      <span className="font-bold text-slate-800">{churnDetails.features?.recency_days} days</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Total Spend</span>
                      <span className="font-bold text-slate-800">₹{churnDetails.features?.total_spend?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <span className="text-slate-500 block">Failed Payments</span>
                      <span className="font-bold text-rose-600">{churnDetails.features?.failed_payments}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-xs font-semibold text-white shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
