import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import type { TabType } from './components/Sidebar';
import { OverviewTab } from './components/OverviewTab';
import { AgentGraphTab } from './components/AgentGraphTab';
import { OpportunitiesTab } from './components/OpportunitiesTab';
import { CustomersTab } from './components/CustomersTab';
import { PaymentsTab } from './components/PaymentsTab';
import { CampaignStudioTab } from './components/CampaignStudioTab';
import { CopilotTab } from './components/CopilotTab';
import { RagTab } from './components/RagTab';
import { AuditLogTab } from './components/AuditLogTab';
import { SettingsTab } from './components/SettingsTab';
import type { DashboardMetrics, Opportunity } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('overview');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [preselectedOpportunity, setPreselectedOpportunity] = useState<Opportunity | null>(null);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    }
  };

  const fetchOpportunities = async () => {
    try {
      const res = await fetch('/api/opportunities');
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchOpportunities();
  }, []);

  const handleRunAnalysis = () => {
    setCurrentTab('agent_graph');
  };

  const handleReloadDemo = async () => {
    const res = await fetch('/api/data/load-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reload demo');
    await fetchMetrics();
    await fetchOpportunities();
  };

  const handleApproveOpportunity = async (id: string) => {
    const res = await fetch(`/api/opportunities/${id}/approve`, { method: 'POST' });
    if (res.ok) {
      await fetchOpportunities();
      await fetchMetrics();
    }
  };

  const handleRejectOpportunity = async (id: string) => {
    const res = await fetch(`/api/opportunities/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Merchant dismissed recommendation' }),
    });
    if (res.ok) {
      await fetchOpportunities();
      await fetchMetrics();
    }
  };

  const handleSelectCampaignOpportunity = (opp: Opportunity) => {
    setPreselectedOpportunity(opp);
    setCurrentTab('campaigns');
  };

  const handleTriggerRecoveryCampaign = () => {
    const recoveryOpp = opportunities.find((o) => o.category === 'REVENUE_RECOVERY');
    if (recoveryOpp) {
      setPreselectedOpportunity(recoveryOpp);
    }
    setCurrentTab('campaigns');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900">
      {/* Top Navbar */}
      <Navbar
        onRunAnalysis={handleRunAnalysis}
        onReloadDemo={handleReloadDemo}
        isRunningAnalysis={isRunningAnalysis}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          opportunityCount={opportunities.length}
          recoverableCount={metrics?.recoverable_count || 327}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'overview' && (
            <OverviewTab
              metrics={metrics}
              onNavigate={setCurrentTab}
              onRunAnalysis={handleRunAnalysis}
            />
          )}

          {currentTab === 'agent_graph' && (
            <AgentGraphTab
              onNavigate={setCurrentTab}
              onRefreshMetrics={() => {
                fetchMetrics();
                fetchOpportunities();
              }}
            />
          )}

          {currentTab === 'opportunities' && (
            <OpportunitiesTab
              opportunities={opportunities}
              onApprove={handleApproveOpportunity}
              onReject={handleRejectOpportunity}
              onSelectCampaignOpportunity={handleSelectCampaignOpportunity}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'customers' && <CustomersTab />}

          {currentTab === 'payments' && (
            <PaymentsTab
              metrics={metrics}
              onNavigate={setCurrentTab}
              onTriggerRecoveryCampaign={handleTriggerRecoveryCampaign}
            />
          )}

          {currentTab === 'campaigns' && (
            <CampaignStudioTab
              opportunities={opportunities}
              preselectedOpportunity={preselectedOpportunity}
              onNavigate={setCurrentTab}
              onRefreshMetrics={() => {
                fetchMetrics();
                fetchOpportunities();
              }}
            />
          )}

          {currentTab === 'copilot' && <CopilotTab />}

          {currentTab === 'rag' && <RagTab />}

          {currentTab === 'audit' && <AuditLogTab />}

          {currentTab === 'settings' && <SettingsTab onReloadDemo={handleReloadDemo} />}
        </main>
      </div>
    </div>
  );
};

export default App;
