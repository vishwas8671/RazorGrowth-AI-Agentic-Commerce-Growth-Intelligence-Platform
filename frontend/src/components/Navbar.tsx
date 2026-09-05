import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Activity, 
  Building2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface NavbarProps {
  onRunAnalysis: () => void;
  onReloadDemo: () => Promise<void>;
  isRunningAnalysis: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRunAnalysis,
  onReloadDemo,
  isRunningAnalysis,
}) => {
  const [isReloading, setIsReloading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleReload = async () => {
    setIsReloading(true);
    try {
      await onReloadDemo();
      setToastMsg('Demo merchant dataset reset successfully (1,000 customers, 5,000 txns)');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      setToastMsg('Failed to reload data');
      setTimeout(() => setToastMsg(null), 3000);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">RazorGrowth</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  AI Platform
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Autonomous Active</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Agentic Commerce Growth Intelligence • Razorpay Track 1</p>
            </div>
          </div>

          {/* Merchant Status & Actions */}
          <div className="flex items-center space-x-3">
            {/* Merchant Identifier */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <Building2 className="h-4 w-4 text-slate-500" />
              <div>
                <span className="font-medium text-slate-700">Velocity Sports & Lifestyle</span>
                <span className="text-slate-400 ml-1.5">MID: RZP_DEMO_902</span>
              </div>
            </div>

            {/* Reload Demo Data Button */}
            <button
              onClick={handleReload}
              disabled={isReloading}
              title="Reset dataset with 1,000 customers & 5,000 transactions"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span>{isReloading ? 'Reloading...' : 'Load Demo Data'}</span>
            </button>

            {/* Run AI Analysis CTA */}
            <button
              onClick={onRunAnalysis}
              disabled={isRunningAnalysis}
              className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm disabled:opacity-60"
            >
              <Activity className={`h-4 w-4 ${isRunningAnalysis ? 'animate-spin' : ''}`} />
              <span>{isRunningAnalysis ? 'Agents Running...' : 'Run AI Growth Analysis'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast Notification */}
      {toastMsg && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center text-xs font-medium text-blue-800 flex items-center justify-center space-x-2 transition-all">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <span>{toastMsg}</span>
        </div>
      )}
    </header>
  );
};
