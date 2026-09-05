import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ExternalLink,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import type { RAGDocument } from '../types';

export const RagTab: React.FC = () => {
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setUploadMessage(`Indexed "${file.name}" into ${data.chunks_created} vector chunks.`);
      fetchDocuments();
      setTimeout(() => setUploadMessage(null), 4000);
    } catch (err) {
      setUploadMessage('Failed to parse or index document.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuery = async (queryText?: string) => {
    const q = queryText || query;
    if (!q.trim() || isQuerying) return;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/documents/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, top_k: 3 }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err) {
      console.error('RAG query error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const sampleQuestions = [
    'What is our return window for sports shoes?',
    'Can we offer a 20% discount on premium running gear?',
    'What is the maximum allowed checkout discount under company policy?'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Policy & Catalog Intelligence (RAG)</h2>
            <span className="text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Retrieval-Augmented Guardrails
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agents cross-reference merchant policy documents (refund rules, discount thresholds, catalogs) to prevent non-compliant offers.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer transition-colors">
          <Upload className="h-4 w-4" />
          <span>{uploading ? 'Chunking & Indexing...' : 'Upload Policy / Catalog'}</span>
          <input
            type="file"
            accept=".txt,.pdf,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {uploadMessage && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{uploadMessage}</span>
        </div>
      )}

      {/* 2-Column Grid: Left: Query Engine, Right: Indexed Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query & Guardrail Verification */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Query Policy Knowledge Base</h3>
            
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sq);
                    handleQuery(sq);
                  }}
                  className="text-xs px-2.5 py-1 rounded bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-600 font-medium transition-colors"
                >
                  🔍 {sq}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuery();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about discounts, refund policy, warranty rules..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-2 px-3 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isQuerying || !query.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm disabled:opacity-50"
              >
                {isQuerying ? 'Searching...' : 'Search Policy'}
              </button>
            </form>

            {/* Answer & Citations */}
            {queryResult && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Grounded Policy Response:
                  </span>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-slate-800 leading-relaxed font-sans">
                    {queryResult.answer}
                  </div>
                </div>

                {queryResult.citations && queryResult.citations.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Exact Document Citations:
                    </span>
                    <div className="space-y-2">
                      {queryResult.citations.map((c: any, idx: number) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                          <div className="font-bold text-slate-800 text-[11px] mb-1 flex items-center space-x-1.5">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span>{c.document} (Chunk #{c.chunk_id})</span>
                          </div>
                          <p className="italic bg-white p-2 rounded border border-slate-100 text-[11px] text-slate-700">
                            "{c.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Indexed Documents List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Indexed Knowledge Vault</h3>
              <span className="text-xs text-slate-500">{documents.length} documents</span>
            </div>

            {loadingDocs ? (
              <div className="py-8 text-center text-slate-400">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No documents indexed yet.</div>
            ) : (
              <div className="space-y-2.5">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-800">
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{doc.filename}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-mono">
                        {doc.file_type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
                      <span>{doc.chunk_count} Vector Chunks</span>
                      <span>{doc.upload_date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
