# RazorGrowth AI — Agentic Commerce Growth Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Tests](https://img.shields.io/badge/Tests-9%20Passed-10B981?style=for-the-badge&logo=pytest&logoColor=white)](file:///tests/test_backend.py)

> **Built for Razorpay AI Internship / Build Challenge**  
> **Track 1: AI Growth & Agentic Commerce**  
> *Transforming Razorpay from a passive payment processor into an autonomous growth and revenue optimization engine.*

---

## 📌 Executive Summary

Merchants typically lose **15% to 30% of addressable GMV** to silent revenue leaks:
- Recoverable payment failures that get abandoned.
- High-value VIP customers churning unnoticed.
- Generic promotions with low conversion and high coupon fatigue.
- Disconnected tools where analytics dashboards don't trigger actions.

**RazorGrowth AI** solves this by uniting **Payment Analytics**, **Predictive Machine Learning**, **Retrieval-Augmented Generation (RAG)**, and **Autonomous Agentic Orchestration** into a single merchant command center.

Instead of just showing charts, RazorGrowth AI:
1. **Detects** payment leaks, churn risks, and cross-sell gaps across live transaction data.
2. **Synthesizes** high-confidence growth opportunities with quantified revenue upside.
3. **Drafts** hyper-personalized multi-channel recovery and promotion campaigns.
4. **Enforces** policy compliance via RAG and Human-in-the-Loop governance.
5. **Executes** actions directly (e.g., generating Razorpay recovery payment links).

---

## 🏛️ System Architecture & Multi-Agent Flow

```mermaid
flowchart TD
    subgraph Data Layer
        DB[(SQLite / Razorpay Data)]
        T[5,000+ Transactions]
        P[327+ Failed Payments]
        C[1,000 Customers]
        POL[Store Policies / Catalog]
    end

    subgraph Intelligence & ML Engine
        RFM[RFM Segmentation Engine]
        RF[Random Forest Churn Predictor]
        ASSOC[Product Cross-Sell Miner]
        RAG[TF-IDF Vector Policy Indexer]
    end

    subgraph Agentic Orchestration Pipeline (SSE Stream)
        ORCH[Orchestrator Agent]
        DATA_AGT[Data Analyst Agent]
        CUST_AGT[Customer Intelligence Agent]
        REV_AGT[Revenue Opportunity Agent]
        STRAT_AGT[Growth Strategy Agent]
        GUARD[Policy Guardrail & Fact-Checker]
    end

    subgraph Governance & Execution Layer
        HITL{Human-in-the-Loop Gate}
        ACTION[Action & Recovery Agent]
        RXPAY[Razorpay Recovery Links]
        CAMPAIGN[Multi-Channel Campaigns (WhatsApp/Email/SMS)]
        AUDIT[(Immutable Audit Log)]
    end

    DB --> DATA_AGT
    RFM & RF --> CUST_AGT
    ASSOC --> REV_AGT
    POL --> RAG --> GUARD

    ORCH --> DATA_AGT --> CUST_AGT --> REV_AGT --> STRAT_AGT --> GUARD
    GUARD --> HITL
    HITL -->|Approved| ACTION
    ACTION --> RXPAY & CAMPAIGN
    ACTION --> AUDIT
```

---

## 🤖 Specialized AI Agents

| Agent | Core Responsibility | Capabilities |
| :--- | :--- | :--- |
| **Orchestrator Agent** | Pipeline state management & SSE streaming | Coordinates sub-agents, computes real-time step progress, broadcasts events to frontend. |
| **Data Analyst Agent** | Payment health & metrics computation | Calculates GMV, net revenue, success/failure ratios, payment gateway health, and leakage. |
| **Customer Intelligence Agent** | Churn prediction & cohort analysis | Scikit-learn Random Forest model predicting churn risk with explainable feature contributions. |
| **Revenue Opportunity Agent** | Opportunity discovery & financial sizing | Pinpoints recoverable failed checkouts, unattached cross-sells, and VIP retention targets. |
| **Growth Strategy Agent** | Creative synthesis & campaign generation | Creates localized copy for WhatsApp, Email, and SMS with expected conversion benchmarks. |
| **Policy Guardrail Agent** | RAG verification & compliance checking | Queries merchant return/discount policies to ensure campaigns never offer illegal discounts. |
| **Action & Recovery Agent** | Execution & simulation | Emits Razorpay payment links, simulates dispatching campaigns, writes to immutable audit log. |

---

## ✨ Core Platform Capabilities

### 1. Payment Failure & Revenue Leakage Recovery
- Categorizes errors into recoverable (`BAD_REQUEST_PAYMENT_TIMED_OUT`, `INSUFFICIENT_FUNDS`, `NETWORK_ERROR`) vs. fatal (`CARD_EXPIRED`, `FRAUD_FLAG`).
- Generates 1-click Razorpay payment recovery links with customizable expiry windows.
- Quantifies recoverable revenue (e.g., ₹7,94,840 across 327 transactions).

### 2. Explainable ML Churn Prediction
- Random Forest model trained on transaction frequency, refund velocity, recency, and failure rate.
- Deep-dive modal displays exact risk scores and Top 3 driving factors (e.g., *78 days since last order*, *2 payment failures in 30 days*).

### 3. Product Association Mining (Cross-Sell Engine)
- Discovers high-affinity product pairs across 5,000 transactions (e.g., *Noise-Cancelling Headphones + USB-C Fast Charger*).
- Recommends bundle pricing and automated post-purchase nudges.

### 4. Interactive Campaign Studio with Live Mockup
- Generates localized copy tailored to each customer segment.
- Live smartphone preview renders WhatsApp chat bubbles, transactional emails, and SMS alerts.
- Built-in simulation sandbox for testing without incurring marketing spend.

### 5. RAG Merchant Policy Engine
- Pre-indexes return policies, warranty terms, and discount guidelines.
- Provides search with verbatim document excerpts and similarity scores.

### 6. Conversational AI Copilot
- Natural language query engine for non-technical merchants.
- Tool-calling support (`calculate_metrics`, `query_database`, `explain_churn`).
- Grounded responses with structured markdown tables and action recommendations.

### 7. Enterprise Audit Trail & Human-in-the-Loop Governance
- High-risk growth actions require merchant approval before dispatch.
- Every decision, approval, and execution is permanently logged in the audit trail with timestamps and confidence scores.

---

## 💻 Tech Stack

- **Backend:** Python 3.10+, FastAPI, Uvicorn, SQLite3, Scikit-Learn, Pandas, NumPy, Pydantic v2, Pytest.
- **Frontend:** React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, Recharts.
- **Design System:** Professional fintech corporate palette (Deep Slate `#0F172A`, Razorpay Blue `#2563EB`, Emerald `#059669`, Amber `#D97706`).
- **Data:** Synthetic generator producing 1,000 customers, 5,000 transactions, 327 failed payments, and store policies.

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Clone the Repository
```bash
git clone https://github.com/vishwas8671/RazorGrowth-AI-Agentic-Commerce-Growth-Intelligence-Platform.git
cd RazorGrowth-AI-Agentic-Commerce-Growth-Intelligence-Platform
```

### 2. Backend Setup
```bash
# Optional: Create and activate a virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and Swagger UI will be available at:
- **API Docs (Swagger UI):** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/health`

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser at:
- **Web App:** `http://localhost:5173/`

### 4. Load Demo Data (Optional / 1-Click)
You can initialize or reset the dataset anytime:
- Click **"Load Demo Data"** in the top navigation bar, or
- Run `curl -X POST http://127.0.0.1:8000/api/data/load-demo`

---

## 🧪 Testing & Verification

Run the full automated test suite verifying database initialization, metrics calculation, ML churn scoring, cross-sell associations, and RAG search:

```bash
pytest tests/ -v
```

Expected output:
```text
tests/test_backend.py::test_health PASSED                         [ 11%]
tests/test_backend.py::test_database_init PASSED                  [ 22%]
tests/test_backend.py::test_metrics_calculation PASSED            [ 33%]
tests/test_backend.py::test_opportunities_generated PASSED        [ 44%]
tests/test_backend.py::test_churn_model_prediction PASSED         [ 55%]
tests/test_backend.py::test_cross_sell_engine PASSED              [ 66%]
tests/test_backend.py::test_rag_engine PASSED                     [ 77%]
tests/test_backend.py::test_campaign_generation PASSED            [ 88%]
tests/test_backend.py::test_audit_log PASSED                       [100%]

============================== 9 passed in 2.14s ==============================
```

---

## 📂 Project Structure

```text
Razorpay/
├── backend/
│   ├── agents/
│   │   ├── orchestrator.py      # Multi-agent graph pipeline & SSE streamer
│   │   └── tools.py             # Agent tools (metrics, SQL, campaigns, simulation)
│   ├── data/                    # Generated demo datasets & CSV exports
│   ├── ml/
│   │   ├── churn_model.py       # Scikit-learn Random Forest churn classifier
│   │   ├── cross_sell_engine.py # Product co-occurrence association miner
│   │   └── segmentation.py      # RFM customer segmentation engine
│   ├── rag/
│   │   └── engine.py            # TF-IDF RAG indexer with source chunk citations
│   ├── data_generator.py        # 1,000 customers & 5,000 transactions generator
│   ├── database.py              # SQLite schema & connection manager
│   ├── main.py                  # FastAPI server & REST/SSE endpoints
│   ├── metrics.py               # Real-time financial & payment metrics engine
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentGraphTab.tsx      # Real-time visual agent graph & SSE log stream
│   │   │   ├── AuditLogTab.tsx        # Compliance audit trail
│   │   │   ├── CampaignStudioTab.tsx  # Multi-channel campaign studio & mobile preview
│   │   │   ├── CopilotTab.tsx         # Natural language conversational analyst
│   │   │   ├── CustomersTab.tsx       # RFM customer explorer & ML churn modal
│   │   │   ├── Navbar.tsx             # MID, live agent status, demo reload CTA
│   │   │   ├── OpportunitiesTab.tsx   # AI revenue opportunity cards & approval
│   │   │   ├── OverviewTab.tsx        # KPI metrics, revenue charts, gateway health
│   │   │   ├── PaymentsTab.tsx        # Failed transaction recovery center
│   │   │   ├── RagTab.tsx             # Policy document search & chunk viewer
│   │   │   ├── SettingsTab.tsx        # AI guardrail thresholds & system settings
│   │   │   └── Sidebar.tsx            # Navigation tabs with live badge counters
│   │   ├── App.tsx                    # Main state management & tab controller
│   │   ├── index.css                  # Tailwind styles & custom typography
│   │   ├── main.tsx                   # React root entry point
│   │   └── types.ts                   # Unified TypeScript domain interfaces
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Fintech corporate color palette
│   └── vite.config.ts                 # Vite config with API proxy to port 8000
├── tests/
│   └── test_backend.py                # Comprehensive backend test suite
├── .gitignore                         # Complete ignore rules for Python, Node, and DB
├── requirements.txt                   # Root Python dependencies
└── README.md                          # Project documentation
```

---

## 🔒 Governance, Safety & Guardrails

- **Threshold Confidence Gate:** Growth opportunities are only presented to the merchant if the multi-agent confidence score exceeds 75%.
- **Human-in-the-Loop Gate:** High-value actions (promotional discounts > 15%, customer communications) require explicit merchant approval.
- **RAG Policy Check:** Agent copy is cross-checked against store terms to prevent hallucinated return guarantees or invalid discount combinations.
- **Tamper-Evident Audit Trail:** Every agent tool invocation, state change, and action execution is permanently recorded.

---

## 👤 Author

- **Vishwas** ([GitHub](https://github.com/vishwas8671))
- **Email:** vishwas7906@gmail.com
- **Track:** Razorpay AI Internship / Build Challenge Track 1
