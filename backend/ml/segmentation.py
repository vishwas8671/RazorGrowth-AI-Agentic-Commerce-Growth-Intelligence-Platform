import os
import sys
from typing import Dict, Any, List
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection

def get_segment_summary() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            segment,
            COUNT(*) as customer_count,
            SUM(total_spend) as total_revenue,
            AVG(total_spend) as avg_monetary,
            AVG(total_orders) as avg_frequency,
            AVG(churn_probability) as avg_churn_risk
        FROM customers
        GROUP BY segment
        ORDER BY total_revenue DESC
    """)
    rows = cursor.fetchall()
    conn.close()

    segments = []
    for r in rows:
        segments.append({
            "segment": r["segment"],
            "customer_count": r["customer_count"],
            "total_revenue": round(r["total_revenue"] or 0.0, 2),
            "avg_spend": round(r["avg_monetary"] or 0.0, 2),
            "avg_orders": round(r["avg_frequency"] or 0.0, 1),
            "avg_churn_risk": round((r["avg_churn_risk"] or 0.0) * 100, 1)
        })
    return segments

def get_customers_by_segment(segment: str, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM customers WHERE segment = ?", (segment,))
    total = cursor.fetchone()["total"]

    cursor.execute("""
        SELECT 
            customer_id, name, email, city, segment,
            total_orders, total_spend, last_purchase_date,
            churn_risk, churn_probability, churn_reasons
        FROM customers
        WHERE segment = ?
        ORDER BY total_spend DESC
        LIMIT ? OFFSET ?
    """, (segment, limit, offset))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "segment": segment,
        "total_count": total,
        "customers": rows
    }
