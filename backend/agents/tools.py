import os
import sys
import json
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection
from metrics import calculate_all_metrics
from ml.churn_model import churn_model_instance
from ml.cross_sell_engine import cross_sell_engine_instance
from ml.segmentation import get_segment_summary, get_customers_by_segment

def query_database(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    # Safe query execution (read-only enforcement)
    clean_sql = sql.strip().upper()
    if not clean_sql.startswith("SELECT") and not clean_sql.startswith("WITH") and not clean_sql.startswith("PRAGMA"):
        return [{"error": "Security restriction: Only read-only SELECT queries are permitted."}]

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(sql, params)
        rows = [dict(r) for r in cursor.fetchall()[:100]]
        conn.close()
        return rows
    except Exception as e:
        conn.close()
        return [{"error": str(e)}]

def tool_calculate_metrics() -> Dict[str, Any]:
    return calculate_all_metrics()

def tool_segment_customers() -> List[Dict[str, Any]]:
    return get_segment_summary()

def tool_predict_churn(customer_id: str) -> Dict[str, Any]:
    return churn_model_instance.predict_customer(customer_id)

def tool_find_failed_payments(recoverable_only: bool = True) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    condition = "WHERE status = 'FAILED' AND is_recoverable = 1" if recoverable_only else "WHERE status = 'FAILED'"
    cursor.execute(f"""
        SELECT 
            p.payment_id, p.transaction_id, p.status, p.failure_reason, p.amount, p.timestamp,
            t.customer_id, c.name as customer_name, c.email as customer_email, t.payment_method, pr.product_name
        FROM payments p
        JOIN transactions t ON p.transaction_id = t.transaction_id
        JOIN customers c ON t.customer_id = c.customer_id
        JOIN products pr ON t.product_id = pr.product_id
        {condition}
        ORDER BY p.timestamp DESC
        LIMIT 50
    """)
    rows = [dict(r) for r in cursor.fetchall()]

    cursor.execute(f"""
        SELECT COUNT(*) as count, SUM(amount) as total_amount
        FROM payments
        {condition}
    """)
    totals = cursor.fetchone()
    conn.close()

    return {
        "count": totals["count"] or 0,
        "total_amount": round(totals["total_amount"] or 0.0, 2),
        "recent_failures": rows
    }

def tool_find_cross_sell_opportunities() -> List[Dict[str, Any]]:
    return cross_sell_engine_instance.get_affinities()

def tool_forecast_revenue(days: int = 30) -> Dict[str, Any]:
    metrics = calculate_all_metrics()
    daily_rev = metrics["revenue"] / 180.0 # Baseline daily run rate from past 6 months
    
    # Growth levers
    recovery_lift = metrics["potential_recovery"] * 0.35 # 35% expected recovery execution
    cross_sell_lift = 161200 * 0.22
    churn_saved = 182500 * 0.28

    projected_baseline = daily_rev * days
    projected_with_ai = projected_baseline + (recovery_lift + cross_sell_lift + churn_saved) * (days / 60.0)

    return {
        "projection_window_days": days,
        "baseline_revenue": round(projected_baseline, 2),
        "projected_revenue_with_growth_ai": round(projected_with_ai, 2),
        "incremental_lift": round(projected_with_ai - projected_baseline, 2),
        "lift_percentage": round(((projected_with_ai - projected_baseline) / projected_baseline) * 100, 1),
        "growth_contributors": [
            {"lever": "Payment Failure Recovery", "impact": round(recovery_lift, 2)},
            {"lever": "Cross-Sell Campaign Execution", "impact": round(cross_sell_lift, 2)},
            {"lever": "VIP Churn Win-Back", "impact": round(churn_saved, 2)}
        ]
    }

def tool_generate_campaign(opportunity_id: str, channel: str = "WHATSAPP") -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities WHERE id = ?", (opportunity_id,))
    opp = cursor.fetchone()
    conn.close()

    if not opp:
        return {"error": f"Opportunity {opportunity_id} not found"}

    opp = dict(opp)
    campaign_id = f"CMP-{uuid.uuid4().hex[:8].upper()}"

    templates = {
        "REVENUE_RECOVERY": {
            "name": f"RazorPay Instant Retry — {opp['title']}",
            "objective": "Recover drop-offs with seamless 1-click Razorpay payment link",
            "offer": "Zero-convenience fee + Priority Express Shipping (Code: SECUREPAY)",
            "subject": "Complete your order seamlessly with Razorpay 1-Click Pay",
            "body": "Hi {{first_name}},\n\nWe noticed a temporary network glitch interrupted your payment of INR {{order_amount}} for {{product_name}}.\n\nGood news: your items are reserved for the next 24 hours. Tap below to securely complete your payment in 1 click via Razorpay UPI / Card:\n{{payment_link}}\n\nUse code SECUREPAY for complimentary express delivery!",
            "conversion": 0.34,
            "duration": "48 Hours"
        },
        "CHURN_PREVENTION": {
            "name": f"VIP Privilege Win-Back — {opp['title']}",
            "objective": "Reactivate high-value customers with personalized VIP store credit",
            "offer": "INR 500 Exclusive Store Credit + Early Access to New Drop",
            "subject": "Exclusive VIP Invitation: INR 500 Store Credit Awaits You",
            "body": "Hello {{first_name}},\n\nAs one of our most valued VIP patrons, your curated perks are ready! We've credited INR 500 directly to your account.\n\nExplore our latest arrivals crafted just for you:\n{{catalog_link}}\n\nValid for 7 days. Reply to chat with your dedicated concierge.",
            "conversion": 0.28,
            "duration": "7 Days"
        },
        "CROSS_SELL": {
            "name": f"Perfect Pair Companion — {opp['title']}",
            "objective": "Drive basket expansion with complementary accessory bundling",
            "offer": "15% off Companion Accessory with your recent purchase",
            "subject": "Complete your gear: 15% off companion accessories",
            "body": "Hey {{first_name}},\n\nLoving your recent purchase? Customers who bought {{base_product}} rate {{recommended_product}} 4.9/5 as the perfect match.\n\nGrab yours today with 15% OFF using code PAIR15 at checkout:\n{{product_link}}\n\nFree shipping included!",
            "conversion": 0.22,
            "duration": "14 Days"
        },
        "UPSELL": {
            "name": f"Pro Upgrade Privilege — {opp['title']}",
            "objective": "Upsell regular buyers to premium tier bundles",
            "offer": "20% off annual subscription + Free Titanium Flask",
            "subject": "Upgrade to Pro: Unlock 20% savings + Premium Gift",
            "body": "Hi {{first_name}},\n\nReady to elevate your experience? Upgrade to our Annual Pro Care Bundle and get 20% lifetime savings plus a complimentary 1L Titanium Sports Flask.\n\nTap to upgrade in seconds: {{upgrade_link}}",
            "conversion": 0.19,
            "duration": "30 Days"
        }
    }

    cat = opp["category"]
    tpl = templates.get(cat, templates["REVENUE_RECOVERY"])

    expected_rev = round(opp["affected_customers"] * tpl["conversion"] * (opp["estimated_revenue"] / max(1, opp["affected_customers"])), 2)

    campaign_data = {
        "id": campaign_id,
        "name": tpl["name"],
        "opportunity_id": opp["id"],
        "target_audience": opp["target_segment"],
        "objective": tpl["objective"],
        "offer": tpl["offer"],
        "message_channel": channel,
        "message_subject": tpl["subject"],
        "message_body": tpl["body"],
        "target_customer_count": opp["affected_customers"],
        "expected_conversion": tpl["conversion"],
        "expected_revenue": expected_rev,
        "duration": tpl["duration"],
        "status": "READY_FOR_APPROVAL"
    }

    # Save draft to database
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO campaigns (
            id, name, opportunity_id, target_audience, objective, offer,
            message_channel, message_subject, message_body, target_customer_count,
            expected_conversion, expected_revenue, duration, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        campaign_data["id"], campaign_data["name"], campaign_data["opportunity_id"],
        campaign_data["target_audience"], campaign_data["objective"], campaign_data["offer"],
        campaign_data["message_channel"], campaign_data["message_subject"], campaign_data["message_body"],
        campaign_data["target_customer_count"], campaign_data["expected_conversion"],
        campaign_data["expected_revenue"], campaign_data["duration"], campaign_data["status"]
    ))
    conn.commit()
    conn.close()

    return campaign_data

def tool_validate_claim(claim_metric: str, claimed_value: float, tolerance: float = 0.05) -> Dict[str, Any]:
    metrics = calculate_all_metrics()
    actual_value = metrics.get(claim_metric)
    
    if actual_value is None:
        return {
            "validated": False,
            "claim_metric": claim_metric,
            "claimed_value": claimed_value,
            "actual_value": None,
            "difference_percentage": None,
            "guardrail_verdict": "REJECTED: Metric not found in source of truth."
        }

    diff = abs(actual_value - claimed_value)
    diff_pct = (diff / actual_value * 100) if actual_value != 0 else 0.0

    is_valid = (diff_pct / 100.0) <= tolerance
    return {
        "validated": is_valid,
        "claim_metric": claim_metric,
        "claimed_value": claimed_value,
        "actual_value": actual_value,
        "difference_percentage": round(diff_pct, 2),
        "guardrail_verdict": "ACCEPTED: Supported by underlying database." if is_valid else f"REJECTED: Hallucinated metric variance exceeds {tolerance*100}% threshold."
    }

def tool_simulate_action(campaign_id: str) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM campaigns WHERE id = ?", (campaign_id,))
    cmp = cursor.fetchone()

    if not cmp:
        conn.close()
        return {"error": f"Campaign {campaign_id} not found"}

    cmp = dict(cmp)
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Simulation execution logic
    target_count = cmp["target_customer_count"]
    conv_rate = cmp["expected_conversion"]
    
    actual_converted = int(target_count * conv_rate)
    actual_recovered_revenue = round(cmp["expected_revenue"] * 0.98, 2)

    sim_results = {
        "dispatched_count": target_count,
        "delivered_rate": 99.4,
        "open_rate": 78.2,
        "click_through_rate": 44.6,
        "conversions": actual_converted,
        "actual_recovered_revenue": actual_recovered_revenue,
        "roi_multiple": "14.8x",
        "channel": cmp["message_channel"],
        "status": "SIMULATION_SUCCESS"
    }

    # Update campaign status
    cursor.execute("""
        UPDATE campaigns 
        SET status = 'EXECUTED_DEMO', executed_at = ?, simulation_results = ?
        WHERE id = ?
    """, (now_str, json.dumps(sim_results), campaign_id))

    # Update associated opportunity status
    if cmp.get("opportunity_id"):
        cursor.execute("UPDATE opportunities SET status = 'EXECUTED' WHERE id = ?", (cmp["opportunity_id"],))

    # Record in Agent Audit Log
    audit_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
        INSERT INTO agent_audit_log (
            id, timestamp, agent_name, action, input_summary, output_summary,
            confidence, human_approval, estimated_impact, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_id, now_str, "Action Agent",
        f"Simulate Campaign Execution: {cmp['name']}",
        f"Target audience: {target_count} customers via {cmp['message_channel']}",
        f"Simulated {actual_converted} conversions yielding INR {actual_recovered_revenue:,.0f} recovered revenue.",
        0.98, "MERCHANT_APPROVED", actual_recovered_revenue, "COMPLETED"
    ))

    conn.commit()
    conn.close()

    return {
        "status": "SUCCESS",
        "campaign_id": campaign_id,
        "executed_at": now_str,
        "results": sim_results
    }
