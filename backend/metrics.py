from database import get_db_connection
from typing import Dict, Any, List
import json

def calculate_all_metrics() -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Total Transactions & Payment Breakdown
    cursor.execute("""
        SELECT 
            COUNT(*) as total_txns,
            SUM(amount) as gmv,
            SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END) as revenue,
            SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed_count,
            SUM(CASE WHEN payment_status = 'FAILED' THEN amount ELSE 0 END) as failed_amount,
            SUM(CASE WHEN payment_status = 'REFUNDED' THEN 1 ELSE 0 END) as refunded_count,
            SUM(CASE WHEN payment_status = 'REFUNDED' THEN amount ELSE 0 END) as refunded_amount
        FROM transactions
    """)
    txn_row = cursor.fetchone()
    total_txns = txn_row["total_txns"] or 0
    gmv = txn_row["gmv"] or 0.0
    revenue = txn_row["revenue"] or 0.0
    success_count = txn_row["success_count"] or 0
    failed_count = txn_row["failed_count"] or 0
    failed_amount = txn_row["failed_amount"] or 0.0
    refunded_count = txn_row["refunded_count"] or 0
    refunded_amount = txn_row["refunded_amount"] or 0.0

    success_rate = (success_count / total_txns * 100) if total_txns > 0 else 0.0
    failure_rate = (failed_count / total_txns * 100) if total_txns > 0 else 0.0
    refund_rate = (refunded_count / total_txns * 100) if total_txns > 0 else 0.0
    aov = (revenue / success_count) if success_count > 0 else 0.0

    # 2. Recoverable Payments
    cursor.execute("""
        SELECT COUNT(*) as recoverable_count, SUM(amount) as recoverable_amount
        FROM payments
        WHERE is_recoverable = 1 AND status = 'FAILED'
    """)
    rec_row = cursor.fetchone()
    recoverable_count = rec_row["recoverable_count"] or 0
    recoverable_amount = rec_row["recoverable_amount"] or 0.0

    # 3. Customer Base & Churn Metrics
    cursor.execute("""
        SELECT 
            COUNT(*) as total_customers,
            SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) as repeat_customers,
            SUM(CASE WHEN churn_risk = 'HIGH' THEN 1 ELSE 0 END) as high_churn_count,
            SUM(CASE WHEN churn_risk = 'HIGH' THEN total_spend ELSE 0 END) as revenue_at_risk,
            AVG(total_spend) as avg_ltv
        FROM customers
    """)
    cust_row = cursor.fetchone()
    total_customers = cust_row["total_customers"] or 0
    repeat_customers = cust_row["repeat_customers"] or 0
    high_churn_count = cust_row["high_churn_count"] or 0
    revenue_at_risk = cust_row["revenue_at_risk"] or 0.0
    avg_ltv = cust_row["avg_ltv"] or 0.0

    repeat_purchase_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0.0
    churn_rate = (high_churn_count / total_customers * 100) if total_customers > 0 else 0.0

    # 4. Total Growth Opportunity Value
    cursor.execute("""
        SELECT SUM(estimated_revenue) as total_growth_opportunity, COUNT(*) as active_opps
        FROM opportunities
        WHERE status = 'PENDING_APPROVAL' OR status = 'APPROVED'
    """)
    opp_row = cursor.fetchone()
    total_growth_opportunity = opp_row["total_growth_opportunity"] or 0.0
    active_opps = opp_row["active_opps"] or 0

    # 5. Customer Segments Breakdown
    cursor.execute("""
        SELECT 
            segment,
            COUNT(*) as customer_count,
            SUM(total_spend) as total_spend,
            AVG(total_spend) as avg_spend,
            AVG(churn_probability) as avg_churn_prob,
            AVG(total_orders) as avg_orders
        FROM customers
        GROUP BY segment
        ORDER BY total_spend DESC
    """)
    segments = []
    for r in cursor.fetchall():
        segments.append({
            "segment": r["segment"],
            "customer_count": r["customer_count"],
            "total_spend": round(r["total_spend"] or 0.0, 2),
            "avg_spend": round(r["avg_spend"] or 0.0, 2),
            "avg_churn_prob": round((r["avg_churn_prob"] or 0.0) * 100, 1),
            "avg_orders": round(r["avg_orders"] or 0.0, 1)
        })

    # 6. Payment Method Breakdown
    cursor.execute("""
        SELECT 
            payment_method,
            COUNT(*) as count,
            SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END) as success_count,
            SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed_count,
            SUM(amount) as total_volume
        FROM transactions
        GROUP BY payment_method
        ORDER BY count DESC
    """)
    payment_methods = []
    for r in cursor.fetchall():
        tot = r["count"]
        fail = r["failed_count"]
        m_fail_rate = (fail / tot * 100) if tot > 0 else 0.0
        payment_methods.append({
            "method": r["payment_method"],
            "total_count": tot,
            "success_count": r["success_count"],
            "failed_count": fail,
            "failure_rate": round(m_fail_rate, 2),
            "volume": round(r["total_volume"] or 0.0, 2)
        })

    # 7. Payment Failure Reasons Breakdown
    cursor.execute("""
        SELECT 
            failure_reason,
            COUNT(*) as failure_count,
            SUM(amount) as lost_amount,
            is_recoverable
        FROM payments
        WHERE status = 'FAILED' AND failure_reason IS NOT NULL
        GROUP BY failure_reason, is_recoverable
        ORDER BY failure_count DESC
    """)
    failure_reasons = []
    for r in cursor.fetchall():
        failure_reasons.append({
            "reason": r["failure_reason"],
            "count": r["failure_count"],
            "amount": round(r["lost_amount"] or 0.0, 2),
            "is_recoverable": bool(r["is_recoverable"])
        })

    # 8. Top Products
    cursor.execute("""
        SELECT 
            p.product_id,
            p.product_name,
            p.category,
            p.price,
            COUNT(t.transaction_id) as sales_count,
            SUM(CASE WHEN t.payment_status = 'SUCCESS' THEN t.amount ELSE 0 END) as revenue_generated
        FROM products p
        LEFT JOIN transactions t ON p.product_id = t.product_id
        GROUP BY p.product_id
        ORDER BY revenue_generated DESC
        LIMIT 6
    """)
    top_products = []
    for r in cursor.fetchall():
        top_products.append({
            "product_id": r["product_id"],
            "product_name": r["product_name"],
            "category": r["category"],
            "price": r["price"],
            "sales_count": r["sales_count"],
            "revenue_generated": round(r["revenue_generated"] or 0.0, 2)
        })

    # 9. Monthly Revenue Trend (Recent 6 months)
    cursor.execute("""
        SELECT 
            strftime('%Y-%m', timestamp) as month,
            SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0 END) as success_revenue,
            SUM(CASE WHEN payment_status = 'FAILED' THEN amount ELSE 0 END) as failed_revenue,
            COUNT(transaction_id) as order_count
        FROM transactions
        GROUP BY month
        ORDER BY month ASC
    """)
    monthly_trend = []
    for r in cursor.fetchall():
        monthly_trend.append({
            "month": r["month"],
            "success_revenue": round(r["success_revenue"] or 0.0, 2),
            "failed_revenue": round(r["failed_revenue"] or 0.0, 2),
            "order_count": r["order_count"]
        })

    conn.close()

    return {
        "gmv": round(gmv, 2),
        "revenue": round(revenue, 2),
        "successful_payments": success_count,
        "failed_payments": failed_count,
        "refunded_payments": refunded_count,
        "success_rate": round(success_rate, 2),
        "failure_rate": round(failure_rate, 2),
        "refund_rate": round(refund_rate, 2),
        "aov": round(aov, 2),
        "avg_ltv": round(avg_ltv, 2),
        "repeat_purchase_rate": round(repeat_purchase_rate, 2),
        "churn_rate": round(churn_rate, 2),
        "revenue_at_risk": round(revenue_at_risk, 2),
        "revenue_leakage": round(failed_amount, 2),
        "potential_recovery": round(recoverable_amount, 2),
        "recoverable_count": recoverable_count,
        "total_growth_opportunity": round(total_growth_opportunity, 2),
        "active_opportunities_count": active_opps,
        "total_customers": total_customers,
        "segments": segments,
        "payment_methods": payment_methods,
        "failure_reasons": failure_reasons,
        "top_products": top_products,
        "monthly_trend": monthly_trend
    }

if __name__ == "__main__":
    metrics = calculate_all_metrics()
    print("Metrics Computed Successfully:")
    print(f"GMV: INR {metrics['gmv']:,.2f}")
    print(f"Revenue: INR {metrics['revenue']:,.2f}")
    print(f"Success Rate: {metrics['success_rate']}%")
    print(f"Potential Recovery: INR {metrics['potential_recovery']:,.2f}")
    print(f"Total AI Growth Opportunity: INR {metrics['total_growth_opportunity']:,.2f}")
