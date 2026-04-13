import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, CheckCircle2, FileText, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReviewDocumentsModal = ({ client, onClose }) => {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approvingIds, setApprovingIds] = useState([]);

    const fetchDocs = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/documents/${client.id}/whatsapp`);
            setDocs(res.data.pendingDocs || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (client) fetchDocs();
    }, [client]);

    const handleApprove = async (doc) => {
        setApprovingIds(prev => [...prev, doc.id]);
        
        // Fast mock approve mirroring DocumentVault
        const formData = new FormData();
        const blob = new Blob(["Simulated Document Content"], { type: doc.type });
        formData.append('file', blob, doc.name);
        formData.append('business_id', client.id);
        formData.append('category', 'Other'); // default category
        formData.append('year', new Date().getFullYear().toString());
        formData.append('month', new Date().toISOString().slice(0, 7));
        formData.append('source_id', doc.id);

        try {
            await axios.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDocs(prev => prev.filter(d => d.id !== doc.id));
        } catch (err) {
            console.error("Approve failed", err);
        } finally {
            setApprovingIds(prev => prev.filter(id => id !== doc.id));
        }
    };

    if (!client) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end bg-slate-900/40 backdrop-blur-sm">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="relative flex w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 sm:w-[400px]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Review Documents</h3>
                        <p className="text-sm font-medium text-slate-500">{client.business_name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors border border-transparent shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                            <p className="text-sm font-medium">Loading documents...</p>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm mt-4">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-bold text-slate-800 mb-1">All caught up!</h4>
                            <p className="text-sm text-slate-500">There are no pending documents to review for this client.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Month Documents</p>
                            {docs.map(doc => (
                                <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-3 transition-all hover:border-indigo-300">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-800 truncate" title={doc.name}>{doc.name}</h4>
                                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                                                {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                {(doc.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                        <a 
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex-1 text-center py-2 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors"
                                        >
                                            View
                                        </a>
                                        <button 
                                            onClick={() => handleApprove(doc)}
                                            disabled={approvingIds.includes(doc.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-white bg-[#0A2C4B] hover:bg-[#002D50] disabled:bg-slate-400 rounded-lg transition-colors shadow-sm"
                                        >
                                            {approvingIds.includes(doc.id) ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Approving</>
                                            ) : (
                                                'Approve'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Direct Inbox Link */}
                {docs.length > 0 && (
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <button 
                            onClick={() => {
                                onClose();
                                navigate(`/ca/client/${client.id}`);
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 bg-[#F5A623]/10 hover:bg-[#F5A623]/20 text-[#E08A00] font-bold rounded-xl transition-colors border border-[#F5A623]/20"
                        >
                            <span className="flex items-center gap-2">
                                Go to WhatsApp Inbox ({docs.length})
                            </span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewDocumentsModal;
