export interface DashboardMetrics {
  gmv: number;
  revenue: number;
  successful_payments: number;
  failed_payments: number;
  refunded_payments: number;
  success_rate: number;
  failure_rate: number;
  refund_rate: number;
  aov: number;
  avg_ltv: number;
  repeat_purchase_rate: number;
  churn_rate: number;
  revenue_at_risk: number;
  revenue_leakage: number;
  potential_recovery: number;
  recoverable_count: number;
  total_growth_opportunity: number;
  active_opportunities_count: number;
  total_customers: number;
  segments: {
    segment: string;
    customer_count: number;
    total_spend: number;
    avg_spend: number;
    avg_churn_prob: number;
    avg_orders: number;
  }[];
  payment_methods: {
    method: string;
    total_count: number;
    success_count: number;
    failed_count: number;
    failure_rate: number;
    volume: number;
  }[];
  failure_reasons: {
    reason: string;
    count: number;
    amount: number;
    is_recoverable: boolean;
  }[];
  top_products: {
    product_id: string;
    product_name: string;
    category: string;
    price: number;
    sales_count: number;
    revenue_generated: number;
  }[];
  monthly_trend: {
    month: string;
    success_revenue: number;
    failed_revenue: number;
    order_count: number;
  }[];
}

export interface Opportunity {
  id: string;
  title: string;
  category: string;
  reason: string;
  target_segment: string;
  affected_customers: number;
  estimated_revenue: number;
  confidence: number;
  recommended_action: string;
  supporting_metrics: { metric: string; value: string }[] | null;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'EXECUTED' | 'REJECTED';
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  opportunity_id?: string;
  target_audience: string;
  objective: string;
  offer: string;
  message_channel: string;
  message_subject?: string;
  message_body: string;
  target_customer_count: number;
  expected_conversion: number;
  expected_revenue: number;
  duration: string;
  status: string;
  executed_at?: string;
  simulation_results?: {
    dispatched_count: number;
    delivered_rate: number;
    open_rate: number;
    click_through_rate: number;
    conversions: number;
    actual_recovered_revenue: number;
    roi_multiple: string;
    channel: string;
    status: string;
  };
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  signup_date: string;
  city: string;
  segment: string;
  total_orders: number;
  total_spend: number;
  last_purchase_date: string | null;
  churn_risk: 'HIGH' | 'MEDIUM' | 'LOW';
  churn_probability: number;
  churn_reasons: string[];
}

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  customer_name: string;
  product_name: string;
  category: string;
  amount: number;
  timestamp: string;
  payment_status: string;
  payment_method: string;
  refund_status: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  agent_name: string;
  action: string;
  input_summary: string;
  output_summary: string;
  confidence: number;
  human_approval: string;
  estimated_impact: number;
  status: string;
}

export interface RAGDocument {
  id: string;
  filename: string;
  file_type: string;
  upload_date: string;
  chunk_count: number;
}
