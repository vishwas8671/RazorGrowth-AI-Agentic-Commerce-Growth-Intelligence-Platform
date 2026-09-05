import React, { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Clock,
  ArrowRight,
  Send
} from 'lucide-react';
import type { Opportunity, Campaign } from '../types';
import type { TabType } from './Sidebar';

interface CampaignStudioTabProps {
  opportunities: Opportunity[];
  preselectedOpportunity: Opportunity | null;
  onNavigate: (tab: TabType) => void;
  onRefreshMetrics: () => void;
}

export const CampaignStudioTab: React.FC<CampaignStudioTabProps> = ({
  opportunities,
  preselectedOpportunity,
  onNavigate,
  onRefreshMetrics,
}) => {
  const [selectedOppId, setSelectedOppId] = useState<string>(
    preselectedOpportunity?.id || (opportunities.length > 0 ? opportunities[0].id : '')
  );
  const [channel, setChannel] = useState<'WHATSAPP' | 'EMAIL' | 'SMS'>('WHATSAPP');
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedOpportunity) {
      setSelectedOppId(preselectedOpportunity.id);
    }
  }, [preselectedOpportunity]);

  const handleGenerateCampaign = async () => {
    if (!selectedOppId) return;
    setIsGenerating(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunity_id: selectedOppId, channel }),
      });
      const data = await res.json();
      setCurrentCampaign(data);
      setToast('AI Campaign drafted successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error('Failed to generate campaign:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateExecution = async () => {
    if (!currentCampaign) return;
    setIsSimulating(true);
    try {
      const res = await fetch('/api/campaigns/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: currentCampaign.id }),
      });
      const data = await res.json();
      setSimulationResult(data.results);
      setToast('Campaign simulated successfully! Action Agent recorded audit event.');
      setTimeout(() => setToast(null), 4000);
      onRefreshMetrics();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedOppId) {
      handleGenerateCampaign();
    }
  }, [selectedOppId, channel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900">Autonomous AI Campaign Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Personalization Agent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Synthesizes personalized growth outreach across WhatsApp, Email, and SMS with human-in-the-loop governance.
          </p>
        </div>

        {toast && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center space-x-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{toast}</span>
          </div>
        )}
      </div>

      {/* Campaign Controls Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunity Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Target Growth Opportunity
          </label>
          <select
            value={selectedOppId}
            onChange={(e) => setSelectedOppId(e.target.value)}
            className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.affected_customers} customers • ₹{opp.estimated_revenue.toLocaleString('en-IN')})
              </option>
            ))}
          </select>
        </div>

        {/* Channel Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Outreach Delivery Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setChannel('WHATSAPP')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                channel === 'WHATSAPP'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => setChannel('EMAIL')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                channel === 'EMAIL'
                  ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span>Email</span>
            </button>
            <button
              onClick={() => setChannel('SMS')}
              className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                channel === 'SMS'
                  ? 'bg-purple-50 text-purple-700 border-purple-400 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5 text-purple-600" />
              <span>SMS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Campaign Builder & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Campaign Parameters & Forecast */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Campaign Specifications</h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                {currentCampaign?.status || 'DRAFT'}
              </span>
            </div>

            {currentCampaign ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Campaign Name</span>
                  <div className="font-bold text-slate-900 text-sm">{currentCampaign.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Target Audience</span>
                    <span className="font-bold text-slate-800">{currentCampaign.target_audience}</span>
                    <span className="text-slate-400 block mt-0.5">({currentCampaign.target_customer_count} customers)</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Offer / Incentive</span>
                    <span className="font-bold text-blue-700">{currentCampaign.offer}</span>
                    <span className="text-slate-400 block mt-0.5">Duration: {currentCampaign.duration}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200">
                    <span className="text-emerald-800 block font-medium">Expected Conversion</span>
                    <span className="font-extrabold text-emerald-700 text-base">
                      {(currentCampaign.expected_conversion * 100).toFixed(1)}%
                    </span>
                    <span className="text-emerald-600 text-[11px] block">
                      ~{Math.round(currentCampaign.target_customer_count * currentCampaign.expected_conversion)} conversions
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                    <span className="text-blue-800 block font-medium">Projected Revenue Lift</span>
                    <span className="font-extrabold text-blue-700 text-base">
                      ₹{currentCampaign.expected_revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-blue-600 text-[11px] block">Net recovered GMV</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-0.5">Objective</span>
                  <p className="text-slate-700">{currentCampaign.objective}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400">Loading campaign draft...</div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Simulated demo mode. No external SMS/WhatsApp cost incurred.</span>
              </div>

              <button
                onClick={handleSimulateExecution}
                disabled={isSimulating || !currentCampaign}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Play className={`h-4 w-4 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>{isSimulating ? 'Simulating Dispatch...' : 'Simulate Campaign Execution'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Results Card */}
          {simulationResult && (
            <div className="bg-white p-5 rounded-xl border border-emerald-300 ring-1 ring-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-900">Action Agent: Execution Simulation Results</h4>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  DEMO EXECUTION SUCCESS
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Delivered Rate</span>
                  <span className="font-bold text-slate-900">{simulationResult.delivered_rate}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Open Rate</span>
                  <span className="font-bold text-slate-900">{simulationResult.open_rate}%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Conversions</span>
                  <span className="font-bold text-emerald-700">{simulationResult.conversions} orders</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-slate-500 block">Recovered Revenue</span>
                  <span className="font-bold text-blue-700">₹{simulationResult.actual_recovered_revenue?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Calculated ROI Multiple: <strong className="text-slate-800">{simulationResult.roi_multiple}</strong></span>
                <button
                  onClick={() => onNavigate('audit')}
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  View in Agent Audit Log →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Channel Preview Mockup */}
        <div className="lg:col-span-5">
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              {channel} Dynamic Message Preview
            </div>

            {/* Mobile / Screen Frame */}
            <div className="w-full max-w-xs bg-white rounded-2xl shadow-md border border-slate-300 overflow-hidden">
              {/* Phone Header */}
              <div className="bg-slate-800 text-white p-3 flex items-center space-x-2.5">
                <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                  VG
                </div>
                <div>
                  <div className="text-xs font-bold">Velocity Sports & Lifestyle</div>
                  <div className="text-[10px] text-slate-400">Verified Razorpay Merchant</div>
                </div>
              </div>

              {/* Message Bubble */}
              <div className="p-4 bg-slate-50 min-h-[260px] flex flex-col justify-end space-y-2">
                <div className="bg-white p-3 rounded-lg rounded-bl-none shadow-sm border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-sans">
                  {currentCampaign ? (
                    currentCampaign.message_body
                      .replace('{{first_name}}', 'Aarav')
                      .replace('{{order_amount}}', '4,999')
                      .replace('{{product_name}}', 'Pro Runner Shoes')
                      .replace('{{base_product}}', 'Pro Runner Shoes')
                      .replace('{{recommended_product}}', 'AeroDry Sports Socks')
                      .replace('{{payment_link}}', 'https://rzp.io/i/demo_recover_982')
                      .replace('{{catalog_link}}', 'https://store.velocity.in/vip-vault')
                      .replace('{{product_link}}', 'https://store.velocity.in/pair/socks')
                      .replace('{{upgrade_link}}', 'https://store.velocity.in/upgrade/pro')
                  ) : (
                    'Generating customized copy...'
                  )}
                </div>

                <div className="text-[10px] text-slate-400 text-right">
                  Just now • Delivered via Razorpay Growth AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
