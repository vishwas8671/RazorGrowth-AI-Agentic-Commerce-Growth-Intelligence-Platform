import sqlite3
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "razorgrowth.db")

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS customers (
        customer_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        signup_date TEXT NOT NULL,
        city TEXT NOT NULL,
        segment TEXT NOT NULL,
        total_orders INTEGER NOT NULL DEFAULT 0,
        total_spend REAL NOT NULL DEFAULT 0.0,
        last_purchase_date TEXT,
        churn_risk TEXT DEFAULT 'LOW',
        churn_probability REAL DEFAULT 0.0,
        churn_reasons TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
        product_id TEXT PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        cost REAL NOT NULL,
        inventory INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS transactions (
        transaction_id TEXT PRIMARY KEY,
        customer_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        amount REAL NOT NULL,
        timestamp TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        refund_status TEXT DEFAULT 'NONE',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
        payment_id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL,
        status TEXT NOT NULL,
        failure_reason TEXT,
        amount REAL NOT NULL,
        timestamp TEXT NOT NULL,
        is_recoverable INTEGER DEFAULT 0,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
    );

    CREATE TABLE IF NOT EXISTS opportunities (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        reason TEXT NOT NULL,
        target_segment TEXT NOT NULL,
        affected_customers INTEGER NOT NULL,
        estimated_revenue REAL NOT NULL,
        confidence REAL NOT NULL,
        recommended_action TEXT NOT NULL,
        supporting_metrics TEXT,
        status TEXT DEFAULT 'PENDING_APPROVAL',
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS campaigns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        opportunity_id TEXT,
        target_audience TEXT NOT NULL,
        objective TEXT NOT NULL,
        offer TEXT NOT NULL,
        message_channel TEXT NOT NULL,
        message_subject TEXT,
        message_body TEXT NOT NULL,
        target_customer_count INTEGER NOT NULL,
        expected_conversion REAL NOT NULL,
        expected_revenue REAL NOT NULL,
        duration TEXT NOT NULL,
        status TEXT DEFAULT 'DRAFT',
        executed_at TEXT,
        simulation_results TEXT,
        FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
    );

    CREATE TABLE IF NOT EXISTS agent_audit_log (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        action TEXT NOT NULL,
        input_summary TEXT,
        output_summary TEXT,
        confidence REAL,
        human_approval TEXT DEFAULT 'NOT_REQUIRED',
        estimated_impact REAL DEFAULT 0.0,
        status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL,
        upload_date TEXT NOT NULL,
        chunk_count INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS document_chunks (
        id TEXT PRIMARY KEY,
        document_id TEXT NOT NULL,
        chunk_index INTEGER NOT NULL,
        text_content TEXT NOT NULL,
        FOREIGN KEY (document_id) REFERENCES documents(id)
    );

    CREATE INDEX IF NOT EXISTS idx_trans_cust ON transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_trans_status ON transactions(payment_status);
    CREATE INDEX IF NOT EXISTS idx_pay_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_cust_segment ON customers(segment);
    """)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
