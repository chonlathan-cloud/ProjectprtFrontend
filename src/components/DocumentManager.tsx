import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Upload, 
  FileSearch, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  Filter
} from 'lucide-react';
import { 
  getInsights, 
  searchDocumentsByNo, 
  uploadDocumentFile, 
  getCases,
  InsightsData 
} from '../services/api';
import { CaseResponse } from '../../types';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const visibleDocuments = showMissingOnly
  ? documents.filter((doc) => !doc.is_receipt_uploaded)
  : documents;


  const loadDocuments = async () => {
    setLoading(true);
    try {
      // Fetch documents from getCases to get the is_receipt_uploaded flag
      const result = await getCases(); 
      setDocuments(result);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadDocuments();
      return;
    }
    setLoading(true);
    try {
      const result = await searchDocumentsByNo(searchQuery);
      setDocuments(result);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCaseId) return;

    setUploading(true);
    try {
      await uploadDocumentFile(selectedCaseId, file);
      setUploadSuccess("File uploaded successfully!");
      loadDocuments();
      setSelectedCaseId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-900 bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-4xl font-black text-slate-800 tracking-tight">Document Manager</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage PV, RV, JV documents and track missing uploads</p>
      </header>

      {/* Top Controls: Upload Box & Search Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Box */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Upload size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Upload Receipt</h2>
                <p className="text-sm text-slate-500 font-bold">Select a document below to upload</p>
              </div>
            </div>

            {selectedCaseId ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={20} />
                    <span className="font-bold text-blue-800">Selected ID: {selectedCaseId.substring(0, 8)}...</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCaseId(null)}
                    className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                  >
                    <X size={18} className="text-blue-600" />
                  </button>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <FileSearch size={20} />
                      Choose File to Upload
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="h-28 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 font-bold bg-slate-50/50 italic">
                First, click 'Upload' on a document in the table
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*, application/pdf"
            />
          </div>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full opacity-50 -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <Search size={28} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Advanced Search</h2>
                <p className="text-sm text-slate-500 font-bold">Search and find any PV / RV / JV No.</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="EX: PV-2024-001..." 
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all text-lg font-bold placeholder:text-slate-300"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-lg hover:bg-amber-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
              >
                Search Documents
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {uploadSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={20} />
          <p className="font-bold">{uploadSuccess}</p>
          <button onClick={() => setUploadSuccess(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} />
          <p className="font-bold">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Document Table */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[500px]">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
             <h2 className="text-2xl font-black text-slate-800">Document Registry</h2>
          </div>
          <div className="flex gap-4">
             <button onClick={loadDocuments} className="p-3 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
               <Clock size={20} />
             </button>
             <button
                onClick={() => setShowMissingOnly((prev) => !prev)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-slate-200 rounded-xl font-black text-sm hover:border-slate-300 transition-all"
              >
                <Filter size={16} />
                {showMissingOnly ? 'Missing only' : 'Show All'}
             </button>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Document No.</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Date</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">ผู้ทำรายการ</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Amount</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Status</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleDocuments.length > 0 ? (
                visibleDocuments.map((doc) => (
                  <tr key={doc.id} className={`hover:bg-slate-50/80 transition-all group ${!doc.is_receipt_uploaded ? 'bg-red-50/30' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${!doc.is_receipt_uploaded ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                           {doc.doc_no ? doc.doc_no.substring(0, 2) : 'PV'}
                         </div>
                         <span className="text-base font-black text-slate-800">{doc.doc_no || doc.case_no}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-bold">
                      {new Date(doc.created_at || doc.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-700">{doc.requester_name || 'Staff User'}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-lg font-black text-slate-900">
                        {parseFloat(doc.requested_amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                        doc.is_receipt_uploaded 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-500 text-white animate-pulse'
                      }`}>
                        {doc.is_receipt_uploaded ? 'Uploaded' : 'Missing File'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => setSelectedCaseId(doc.id)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-xl font-black text-xs transition-all ${
                          selectedCaseId === doc.id 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Upload size={14} />
                        {selectedCaseId === doc.id ? 'Ready...' : 'Upload'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-slate-400">
                     <FileSearch size={64} className="mx-auto mb-4 opacity-20" />
                     <p className="text-xl font-black">No matching records found</p>
                     <button onClick={loadDocuments} className="text-blue-600 font-bold mt-2 hover:underline">Clear all filters</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
