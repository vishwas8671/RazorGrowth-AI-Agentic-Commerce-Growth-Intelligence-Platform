import os
import sys
import json
import uuid
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from database import get_db_connection, init_db
from data_generator import generate_data
from metrics import calculate_all_metrics
from ml.churn_model import churn_model_instance
from ml.segmentation import get_segment_summary, get_customers_by_segment
from ml.cross_sell_engine import cross_sell_engine_instance
from agents.tools import tool_generate_campaign, tool_simulate_action, tool_find_failed_payments
from agents.orchestrator import orchestrator_instance
from rag.engine import rag_engine_instance

app = FastAPI(
    title="RazorGrowth AI — Agentic Commerce Growth Intelligence Platform",
    description="Autonomous AI Growth Engine for Merchants on Razorpay",
    version="1.0.0"
)

# CORS Middleware to support frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
# Request Models
# ----------------------------------------------------
class CopilotQueryRequest(BaseModel):
    query: str

class CampaignGenerateRequest(BaseModel):
    opportunity_id: str
    channel: Optional[str] = "WHATSAPP"

class CampaignSimulateRequest(BaseModel):
    campaign_id: str

class OpportunityStatusRequest(BaseModel):
    reason: Optional[str] = None

class DocumentQueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

# ----------------------------------------------------
# API Endpoints
# ----------------------------------------------------

@app.on_event("startup")
def on_startup():
    init_db()
    # Check if database has records
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM customers")
    cnt = cursor.fetchone()["cnt"]
    conn.close()
    if cnt == 0:
        print("Empty database detected. Seeding synthetic demo merchant data...")
        generate_data()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "platform": "RazorGrowth AI", "timestamp": datetime.now().isoformat()}

@app.get("/api/dashboard")
def get_dashboard_metrics():
    """Returns aggregated high-level business and growth KPIs."""
    try:
        metrics = calculate_all_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers")
def get_customers(
    segment: Optional[str] = None,
    risk: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100)
):
    """Paginated customer records with filtering."""
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    if segment and segment.lower() != "all":
        conditions.append("segment = ?")
        params.append(segment)

    if risk and risk.lower() != "all":
        conditions.append("churn_risk = ?")
        params.append(risk.upper())

    if search:
        conditions.append("(name LIKE ? OR email LIKE ? OR city LIKE ?)")
        term = f"%{search}%"
        params.extend([term, term, term])

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    cursor.execute(f"SELECT COUNT(*) as total FROM customers {where_clause}", tuple(params))
    total = cursor.fetchone()["total"]

    offset = (page - 1) * limit
    cursor.execute(f"""
        SELECT 
            customer_id, name, email, signup_date, city, segment,
            total_orders, total_spend, last_purchase_date,
            churn_risk, churn_probability, churn_reasons
        FROM customers
        {where_clause}
        ORDER BY total_spend DESC
        LIMIT ? OFFSET ?
    """, tuple(params + [limit, offset]))

    customers = []
    for r in cursor.fetchall():
        item = dict(r)
        try:
            item["churn_reasons"] = json.loads(item["churn_reasons"]) if item["churn_reasons"] else []
        except:
            item["churn_reasons"] = [item["churn_reasons"]]
        customers.append(item)

    conn.close()
    return {
        "page": page,
        "limit": limit,
        "total_records": total,
        "total_pages": (total + limit - 1) // limit,
        "customers": customers
    }

@app.get("/api/customers/{customer_id}/churn")
def get_customer_churn_analysis(customer_id: str):
    """Predicts customer churn probability with ML-based explainable attribution."""
    res = churn_model_instance.predict_customer(customer_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

@app.get("/api/transactions")
def get_transactions(
    status: Optional[str] = None,
    method: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100)
):
    """Paginated transaction logs."""
    conn = get_db_connection()
    cursor = conn.cursor()

    conditions = []
    params = []

    if status and status.lower() != "all":
        conditions.append("t.payment_status = ?")
        params.append(status.upper())

    if method and method.lower() != "all":
        conditions.append("t.payment_method = ?")
        params.append(method.upper())

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    cursor.execute(f"SELECT COUNT(*) as total FROM transactions t {where_clause}", tuple(params))
    total = cursor.fetchone()["total"]

    offset = (page - 1) * limit
    cursor.execute(f"""
        SELECT 
            t.transaction_id, t.customer_id, c.name as customer_name,
            p.product_name, p.category, t.amount, t.timestamp,
            t.payment_status, t.payment_method, t.refund_status
        FROM transactions t
        JOIN customers c ON t.customer_id = c.customer_id
        JOIN products p ON t.product_id = p.product_id
        {where_clause}
        ORDER BY t.timestamp DESC
        LIMIT ? OFFSET ?
    """, tuple(params + [limit, offset]))

    txns = [dict(r) for r in cursor.fetchall()]
    conn.close()

    return {
        "page": page,
        "limit": limit,
        "total_records": total,
        "total_pages": (total + limit - 1) // limit,
        "transactions": txns
    }

@app.get("/api/payments/failures")
def get_failed_payments(recoverable_only: bool = False):
    """Detailed analytics on failed transactions and recoverable revenue."""
    return tool_find_failed_payments(recoverable_only=recoverable_only)

@app.get("/api/opportunities")
def get_opportunities():
    """Lists all AI-detected growth opportunities."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities ORDER BY estimated_revenue DESC")
    opps = []
    for r in cursor.fetchall():
        item = dict(r)
        if item.get("supporting_metrics"):
            try:
                item["supporting_metrics"] = json.loads(item["supporting_metrics"])
            except:
                pass
        opps.append(item)
    conn.close()
    return opps

@app.post("/api/opportunities/{opportunity_id}/approve")
def approve_opportunity(opportunity_id: str):
    """Merchant approval for an opportunity."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM opportunities WHERE id = ?", (opportunity_id,))
    opp = cursor.fetchone()
    if not opp:
        conn.close()
        raise HTTPException(status_code=404, detail="Opportunity not found")

    cursor.execute("UPDATE opportunities SET status = 'APPROVED' WHERE id = ?", (opportunity_id,))

    # Log in audit table
    audit_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
        INSERT INTO agent_audit_log (
            id, timestamp, agent_name, action, input_summary, output_summary,
            confidence, human_approval, estimated_impact, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Merchant Governance",
        f"Approved Growth Opportunity: {opp['title']}",
        f"Merchant authorized growth playbook for {opp['affected_customers']} customers.",
        f"Opportunity status updated to APPROVED. Unlocked campaign dispatch.",
        opp["confidence"], "APPROVED", opp["estimated_revenue"], "ACTIVE"
    ))

    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": f"Opportunity {opportunity_id} approved."}

@app.post("/api/opportunities/{opportunity_id}/reject")
def reject_opportunity(opportunity_id: str, body: OpportunityStatusRequest):
    """Merchant rejection for an opportunity."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE opportunities SET status = 'REJECTED' WHERE id = ?", (opportunity_id,))

    audit_id = f"AUD-{uuid.uuid4().hex[:8].upper()}"
    cursor.execute("""
        INSERT INTO agent_audit_log (
            id, timestamp, agent_name, action, input_summary, output_summary,
            confidence, human_approval, estimated_impact, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        audit_id, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "Merchant Governance",
        f"Rejected Opportunity: {opportunity_id}",
        f"Merchant dismissed recommendation. Reason: {body.reason or 'User preference'}",
        "Archived recommendation.",
        1.0, "REJECTED", 0.0, "ARCHIVED"
    ))

    conn.commit()
    conn.close()
    return {"status": "SUCCESS", "message": f"Opportunity {opportunity_id} rejected."}

@app.get("/api/campaigns")
def get_campaigns():
    """Lists all generated campaigns and simulations."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM campaigns ORDER BY rowid DESC")
    campaigns = []
    for r in cursor.fetchall():
        item = dict(r)
        if item.get("simulation_results"):
            try:
                item["simulation_results"] = json.loads(item["simulation_results"])
            except:
                pass
        campaigns.append(item)
    conn.close()
    return campaigns

@app.post("/api/campaigns/generate")
def generate_campaign_api(body: CampaignGenerateRequest):
    """Generates tailored multi-channel campaign content for an opportunity."""
    res = tool_generate_campaign(body.opportunity_id, channel=body.channel or "WHATSAPP")
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.post("/api/campaigns/simulate")
def simulate_campaign_api(body: CampaignSimulateRequest):
    """Simulates action execution in demo mode under Action Agent."""
    res = tool_simulate_action(body.campaign_id)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res

@app.get("/api/agent/analyze/stream")
async def stream_agent_analysis():
    """SSE streaming endpoint for real-time multi-agent graph execution."""
    return StreamingResponse(
        orchestrator_instance.run_growth_pipeline_stream(),
        media_type="text/event-stream"
    )

@app.post("/api/agent/chat")
def copilot_chat(body: CopilotQueryRequest):
    """Natural Language Business Copilot with tool execution."""
    return orchestrator_instance.handle_copilot_query(body.query)

@app.get("/api/agents/activity")
def get_agent_audit_log():
    """Returns complete audit trail of all agent decisions and executions."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agent_audit_log ORDER BY timestamp DESC LIMIT 50")
    logs = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return logs

@app.get("/api/documents")
def list_rag_documents():
    """Lists indexed RAG policy documents."""
    return rag_engine_instance.list_documents()

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    """Uploads and indexes merchant policy / catalog document."""
    content_bytes = await file.read()
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()

    text_content = ""
    if ext == ".txt":
        text_content = content_bytes.decode("utf-8", errors="ignore")
    elif ext == ".pdf":
        try:
            import pypdf
            import io
            reader = pypdf.PdfReader(io.BytesIO(content_bytes))
            for p in reader.pages:
                text_content += p.extract_text() + "\n"
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    elif ext in [".docx", ".doc"]:
        try:
            import docx
            import io
            doc = docx.Document(io.BytesIO(content_bytes))
            text_content = "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {str(e)}")
    else:
        text_content = content_bytes.decode("utf-8", errors="ignore")

    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Document contains no readable text.")

    res = rag_engine_instance.add_document(filename, text_content, file_type=ext.replace(".", ""))
    return res

@app.post("/api/documents/query")
def query_rag(body: DocumentQueryRequest):
    """Queries indexed RAG documents with citations."""
    return rag_engine_instance.query(body.query, top_k=body.top_k or 3)

@app.post("/api/data/load-demo")
def reset_demo_data():
    """1-Click reload of synthetic demo merchant data."""
    cust_count, txn_count = generate_data()
    return {
        "status": "SUCCESS",
        "message": f"Demo merchant data loaded successfully: {cust_count:,} customers, {txn_count:,} transactions, 5 opportunities ready."
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
