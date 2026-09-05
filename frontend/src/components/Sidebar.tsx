import React from 'react';
import { 
  LayoutDashboard, 
  Workflow, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Megaphone, 
  Bot, 
  FileText, 
  ClipboardList, 
  Settings,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export type TabType = 
  | 'overview' 
  | 'agent_graph' 
  | 'opportunities' 
  | 'customers' 
  | 'payments' 
  | 'campaigns' 
  | 'copilot' 
  | 'rag' 
  | 'audit' 
  | 'settings';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  opportunityCount?: number;
  recoverableCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  opportunityCount = 5,
  recoverableCount = 327,
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'agent_graph', label: 'AI Growth Agent', icon: Workflow, badge: 'Live Graph', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'opportunities', label: 'Revenue Opportunities', icon: TrendingUp, badge: opportunityCount, badgeColor: 'bg-amber-100 text-amber-800 font-semibold' },
    { id: 'customers', label: 'Customers & Segments', icon: Users },
    { id: 'payments', label: 'Payments & Recovery', icon: CreditCard, badge: recoverableCount, badgeColor: 'bg-rose-100 text-rose-700' },
    { id: 'campaigns', label: 'Campaign Studio', icon: Megaphone },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, badge: 'Tool Use', badgeColor: 'bg-purple-100 text-purple-700' },
    { id: 'rag', label: 'Policy & Catalog RAG', icon: FileText },
    { id: 'audit', label: 'Agent Activity', icon: ClipboardList },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 px-3">
          Growth Navigation
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold pl-2.5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Human-in-the-loop governance badge */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 m-3 rounded-lg border">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 mb-1">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Governance & Guardrails</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Autonomous recommendations require merchant approval before simulated dispatch.
        </p>
      </div>
    </aside>
  );
};
