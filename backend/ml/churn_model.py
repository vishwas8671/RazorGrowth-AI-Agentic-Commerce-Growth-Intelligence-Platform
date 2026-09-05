import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from typing import Dict, Any, List, Optional
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection

class ChurnPredictionModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            "recency_days",
            "total_orders",
            "total_spend",
            "avg_order_value",
            "failed_payment_count",
            "days_as_customer"
        ]
        self._train_model()

    def _train_model(self):
        conn = get_db_connection()
        query = """
            SELECT 
                c.customer_id,
                c.total_orders,
                c.total_spend,
                c.signup_date,
                c.last_purchase_date,
                c.churn_probability as target_prob,
                COALESCE(f.fail_count, 0) as failed_payment_count
            FROM customers c
            LEFT JOIN (
                SELECT customer_id, COUNT(*) as fail_count 
                FROM transactions 
                WHERE payment_status = 'FAILED' 
                GROUP BY customer_id
            ) f ON c.customer_id = f.customer_id
        """
        df = pd.read_sql_query(query, conn)
        conn.close()

        if len(df) < 50:
            return

        ref_date = datetime(2026, 9, 1)

        features = []
        labels = []

        for _, row in df.iterrows():
            # Recency
            lpd = row["last_purchase_date"]
            if lpd and not pd.isna(lpd) and str(lpd).strip().lower() not in ('nan', 'none', ''):
                try:
                    last_dt = datetime.strptime(str(lpd)[:19], "%Y-%m-%d %H:%M:%S")
                    recency = (ref_date - last_dt).days
                except Exception:
                    recency = 180
            else:
                recency = 180

            signup_dt = datetime.strptime(str(row["signup_date"])[:19], "%Y-%m-%d %H:%M:%S")
            days_as_cust = (ref_date - signup_dt).days

            orders = row["total_orders"]
            spend = row["total_spend"]
            aov = spend / orders if orders > 0 else 0.0
            failed = row["failed_payment_count"]

            features.append([recency, orders, spend, aov, failed, days_as_cust])
            
            # Ground truth proxy for churn: recency > 60 and no orders recently or target_prob > 0.65
            is_churned = 1 if (recency > 60 or row["target_prob"] > 0.60) else 0
            labels.append(is_churned)

        X = np.array(features)
        y = np.array(labels)

        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled, y)
        self.is_trained = True

    def predict_customer(self, customer_id: str) -> Dict[str, Any]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.customer_id, c.name, c.email, c.total_orders, c.total_spend,
                c.signup_date, c.last_purchase_date,
                COALESCE((SELECT COUNT(*) FROM transactions WHERE customer_id = c.customer_id AND payment_status = 'FAILED'), 0) as failed_payments
            FROM customers c
            WHERE c.customer_id = ?
        """, (customer_id,))
        row = cursor.fetchone()
        conn.close()

        if not row:
            return {"error": "Customer not found"}

        ref_date = datetime(2026, 9, 1)
        lpd = row["last_purchase_date"]
        if lpd and str(lpd).strip().lower() not in ('nan', 'none', ''):
            try:
                last_dt = datetime.strptime(str(lpd)[:19], "%Y-%m-%d %H:%M:%S")
                recency = (ref_date - last_dt).days
            except Exception:
                recency = 180
        else:
            recency = 180

        signup_dt = datetime.strptime(str(row["signup_date"])[:19], "%Y-%m-%d %H:%M:%S")
        days_as_cust = (ref_date - signup_dt).days
        orders = row["total_orders"]
        spend = row["total_spend"]
        aov = spend / orders if orders > 0 else 0.0
        failed = row["failed_payments"]

        feature_vector = np.array([[recency, orders, spend, aov, failed, days_as_cust]])

        if self.is_trained:
            scaled_vec = self.scaler.transform(feature_vector)
            churn_prob = float(self.model.predict_proba(scaled_vec)[0][1])
        else:
            churn_prob = 0.85 if recency > 60 else 0.20

        # Determine risk level
        if churn_prob >= 0.65:
            risk_level = "HIGH"
        elif churn_prob >= 0.35:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Explainable reasons
        reasons = []
        if recency > 60:
            reasons.append(f"No purchase in {recency} days")
        elif recency > 30:
            reasons.append(f"{recency} days since last purchase (frequency slowing)")
        else:
            reasons.append("Recent purchase within last 30 days")

        if failed > 0:
            reasons.append(f"{failed} transaction failure(s) detected causing friction")

        if orders > 3 and recency > 45:
            reasons.append(f"Historical regular buyer ({orders} orders) has become dormant")
        elif orders <= 1:
            reasons.append("Single-purchase buyer with low initial engagement")

        if spend >= 15000 and churn_prob >= 0.60:
            reasons.append(f"High lifetime value at risk: INR {spend:,.0f}")

        return {
            "customer_id": row["customer_id"],
            "name": row["name"],
            "email": row["email"],
            "churn_probability": round(churn_prob, 3),
            "risk_level": risk_level,
            "reasons": reasons,
            "features": {
                "recency_days": recency,
                "total_orders": orders,
                "total_spend": spend,
                "avg_order_value": round(aov, 2),
                "failed_payments": failed,
                "days_as_customer": days_as_cust
            }
        }

    def get_feature_importances(self) -> List[Dict[str, Any]]:
        if not self.is_trained:
            return []
        importances = self.model.feature_importances_
        return [
            {"feature": name, "importance": round(float(imp), 4)}
            for name, imp in zip(self.feature_names, importances)
        ]

# Global singleton
churn_model_instance = ChurnPredictionModel()
