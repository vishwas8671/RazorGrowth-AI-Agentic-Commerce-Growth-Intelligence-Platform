import os
import sys
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection

# Pre-seeded default merchant policy documents
DEFAULT_POLICIES = [
    {
        "filename": "Merchant_Standard_Refund_Policy.txt",
        "content": """RAZORGROWTH MERCHANT STANDARD REFUND & CANCELLATION POLICY (v2.4)

1. General Refund Window:
Customers are entitled to request a full refund within 14 calendar days of delivery for physical goods, and within 48 hours of transaction completion for digital or consumable items, provided items are undamaged and in original packaging.

2. Failed Transaction Automatic Reversal:
Any transaction where customer funds were debited but payment status was marked FAILED due to bank gateway timeout or network drop is automatically scheduled for auto-refund within 3 to 5 banking business days via the Razorpay payment gateway reconciliation protocol.

3. Restocking & Return Shipping:
For footwear and wearables (e.g., Pro Runner Shoes), size exchanges are 100% complimentary. If the customer requests a monetary return rather than exchange, a nominal restocking fee of INR 150 applies unless the return was due to defective merchandise.

4. Non-Refundable Categories:
Opened skincare serums (GlowMax Vitamin C), consumable nutritional supplements (HydroPure Whey Protein) once the safety seal is broken, and clearance sale items discounted over 50% are strictly non-refundable for hygiene and safety standards."""
    },
    {
        "filename": "Merchant_Growth_Campaign_Guidelines.txt",
        "content": """RAZORGROWTH PROMOTIONAL CAMPAIGN & DISCOUNT AUTHORIZATION GUIDELINES

1. Maximum Permissible Discount Limits:
- Footwear & Sports: Up to 20% discount authorized for churn win-back campaigns on orders over INR 2,500.
- Electronics & Smart Wearables: Maximum 15% discount or bundled companion accessory (e.g. sports socks or flask).
- Health & Nutrition: Maximum 10% instant discount; subscription bundles may offer up to 20% for 3-month recurring commitments.

2. WhatsApp & SMS Outreach Compliance:
All automated promotional dispatches must respect TRAI DND regulations. Dispatches may only occur between 09:00 AM and 08:00 PM IST. Every message must include an explicit opt-out instruction (e.g., 'Reply STOP to unsubscribe').

3. Payment Failure Recovery Playbook:
When reaching out to customers with failed transactions:
- The recovery link must remain valid for exactly 48 hours.
- A courtesy instant incentive of 5% off (code: RECOVER5) or free priority express shipping may be automatically attached to recover cart abandonment on orders exceeding INR 1,000."""
    },
    {
        "filename": "Product_Catalog_Eligibility_Matrix.txt",
        "content": """RAZORGROWTH PRODUCT CATALOG & CAMPAIGN ELIGIBILITY MATRIX

1. Cross-Sell Eligible Bundles:
- 'Pro Runner Nitro Carbon Shoes' (P001) is approved for co-promotion with 'AeroDry Breathable Sports Socks' (P002) and 'AuraFit Smart Band Pro GPS' (P003).
- 'ColdBrew Precision Coffee Infuser' (P009) is approved for complimentary 100g sample of 'PureBrew Single-Origin Arabica Beans' (P014).

2. VIP Exclusive Perks:
VIP tier customers (lifetime spend > INR 20,000) are eligible for:
- Free express next-day delivery on all orders.
- Dedicated concierge customer support via WhatsApp.
- Exclusive preview access to limited-edition product drops 48 hours prior to public release."""
    }
]

class RAGEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(stop_words="english")
        self.chunk_ids = []
        self.chunk_texts = []
        self.chunk_sources = []
        self.matrix = None
        self._initialize_index()

    def _initialize_index(self):
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if default policies exist in DB
        cursor.execute("SELECT COUNT(*) as cnt FROM documents")
        cnt = cursor.fetchone()["cnt"]

        if cnt == 0:
            for pol in DEFAULT_POLICIES:
                self._ingest_text(pol["filename"], pol["content"], conn)

        # Load all chunks from DB into in-memory vector index
        cursor.execute("""
            SELECT c.id, c.text_content, d.filename 
            FROM document_chunks c 
            JOIN documents d ON c.document_id = d.id
        """)
        rows = cursor.fetchall()
        conn.close()

        self.chunk_ids = []
        self.chunk_texts = []
        self.chunk_sources = []

        for r in rows:
            self.chunk_ids.append(r["id"])
            self.chunk_texts.append(r["text_content"])
            self.chunk_sources.append(r["filename"])

        if self.chunk_texts:
            self.matrix = self.vectorizer.fit_transform(self.chunk_texts)

    def _chunk_text(self, text: str, chunk_size: int = 400, overlap: int = 50) -> List[str]:
        words = text.split()
        if len(words) <= chunk_size:
            return [text.strip()]
        chunks = []
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk.strip())
        return chunks

    def _ingest_text(self, filename: str, content: str, conn):
        cursor = conn.cursor()
        doc_id = f"DOC-{uuid.uuid4().hex[:8]}"
        chunks = self._chunk_text(content)

        cursor.execute(
            "INSERT INTO documents (id, filename, file_type, upload_date, chunk_count) VALUES (?, ?, ?, ?, ?)",
            (doc_id, filename, "txt", datetime.now().strftime("%Y-%m-%d %H:%M:%S"), len(chunks))
        )

        for idx, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}-C{idx:03d}"
            cursor.execute(
                "INSERT INTO document_chunks (id, document_id, chunk_index, text_content) VALUES (?, ?, ?, ?)",
                (chunk_id, doc_id, idx, chunk)
            )
        conn.commit()

    def add_document(self, filename: str, content: str, file_type: str = "txt") -> Dict[str, Any]:
        conn = get_db_connection()
        self._ingest_text(filename, content, conn)
        conn.close()
        self._initialize_index()
        return {
            "status": "success",
            "filename": filename,
            "total_chunks_indexed": len(self.chunk_texts)
        }

    def query(self, query_text: str, top_k: int = 3) -> Dict[str, Any]:
        if not self.chunk_texts or self.matrix is None:
            return {
                "query": query_text,
                "answer": "No documents are currently indexed in the knowledge base.",
                "citations": []
            }

        q_vec = self.vectorizer.transform([query_text])
        similarities = cosine_similarity(q_vec, self.matrix).flatten()
        top_indices = np.argsort(similarities)[::-1][:top_k]

        citations = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.05:
                citations.append({
                    "chunk_id": self.chunk_ids[idx],
                    "document": self.chunk_sources[idx],
                    "similarity_score": round(score, 3),
                    "snippet": self.chunk_texts[idx]
                })

        if not citations:
            answer = "I could not find relevant policy guidelines or catalog entries matching this specific query in the current documentation."
        else:
            # Compose grounded synthesis answer
            best_snippet = citations[0]["snippet"]
            answer = f"According to {citations[0]['document']}:\n\n{best_snippet}"

        return {
            "query": query_text,
            "answer": answer,
            "citations": citations
        }

    def list_documents(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, filename, file_type, upload_date, chunk_count FROM documents")
        docs = [dict(r) for r in cursor.fetchall()]
        conn.close()
        return docs

rag_engine_instance = RAGEngine()
