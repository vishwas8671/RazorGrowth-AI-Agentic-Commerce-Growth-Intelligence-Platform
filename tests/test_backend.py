import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))
from main import app
from metrics import calculate_all_metrics
from ml.churn_model import churn_model_instance
from ml.cross_sell_engine import cross_sell_engine_instance
from agents.tools import tool_calculate_metrics, tool_find_failed_payments, tool_find_cross_sell_opportunities

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_metrics_calculation():
    metrics = calculate_all_metrics()
    assert metrics["gmv"] > 0
    assert metrics["revenue"] > 0
    assert metrics["success_rate"] > 0
    assert metrics["total_growth_opportunity"] > 0
    assert len(metrics["segments"]) > 0
    assert len(metrics["payment_methods"]) > 0

def test_churn_prediction():
    res = churn_model_instance.predict_customer("C0001")
    assert "churn_probability" in res
    assert 0.0 <= res["churn_probability"] <= 1.0
    assert res["risk_level"] in ["HIGH", "MEDIUM", "LOW"]
    assert len(res["reasons"]) > 0

def test_cross_sell_engine():
    affinities = cross_sell_engine_instance.get_affinities()
    assert len(affinities) > 0
    first = affinities[0]
    assert "base_product_name" in first
    assert "recommended_product_name" in first
    assert first["expected_revenue"] > 0

def test_api_dashboard():
    res = client.get("/api/dashboard")
    assert res.status_code == 200
    data = res.json()
    assert "gmv" in data
    assert "revenue" in data
    assert "total_growth_opportunity" in data

def test_api_opportunities():
    res = client.get("/api/opportunities")
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 4
    first_opp_id = opps[0]["id"]
    
    # Test approval endpoint
    appr_res = client.post(f"/api/opportunities/{first_opp_id}/approve")
    assert appr_res.status_code == 200

def test_api_campaign_generation_and_simulation():
    res = client.get("/api/opportunities")
    opp_id = res.json()[0]["id"]

    # Generate campaign
    gen_res = client.post("/api/campaigns/generate", json={"opportunity_id": opp_id, "channel": "WHATSAPP"})
    assert gen_res.status_code == 200
    camp = gen_res.json()
    assert "id" in camp
    assert camp["status"] == "READY_FOR_APPROVAL"

    # Simulate campaign
    sim_res = client.post("/api/campaigns/simulate", json={"campaign_id": camp["id"]})
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["status"] == "SUCCESS"
    assert "results" in sim_data

def test_copilot_chat():
    res = client.post("/api/agent/chat", json={"query": "How much revenue can we recover from failed payments?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["tool_calls"]) > 0

def test_rag_query():
    res = client.post("/api/documents/query", json={"query": "What is our refund policy?"})
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["citations"]) > 0
