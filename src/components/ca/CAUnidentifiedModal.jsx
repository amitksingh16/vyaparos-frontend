import React, { useState } from 'react';
import { X, FileText, CheckCircle2, User as UserIcon } from 'lucide-react';
import axios from 'axios';

const CAUnidentifiedModal = ({ isOpen, onClose, unidentifiedDocs, clients, onAssign }) => {
    const [assigningDocId, setAssigningDocId] = useState(null);
    const [assignTargetClient, setAssignTargetClient] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    if (!isOpen) return null;

    // Group documents by staff
    const groupedDocs = unidentifiedDocs.reduce((acc, doc) => {
        const staffName = doc.receiver_staff?.name || 'Unknown Staff';
        if (!acc[staffName]) {
            acc[staffName] = [];
        }
        acc[staffName].push(doc);
        return acc;
    }, {});

    const handleAssign = async (docId) => {
        if (!assignTargetClient) return;
        setIsAssigning(true);
        try {
            await axios.put(`/documents/unidentified/${docId}/assign`, {
                business_id: assignTargetClient
            });
            onAssign(); // Refresh data
            setAssigningDocId(null);
            setAssignTargetClient("");
        } catch (err) {
            console.error("Error assigning document", err);
            alert("Failed to assign document");
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Unidentified Documents Repository</h2>
                            <p className="text-sm text-slate-500">Firm-wide view of all unassigned WhatsApp documents</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    {Object.keys(groupedDocs).length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                            <FileText className="w-12 h-12 text-slate-300 mb-3" />
                            <p>No unidentified documents found.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(groupedDocs).map(([staffName, docs]) => (
                                <div key={staffName} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                                        <UserIcon className="w-5 h-5 text-indigo-500" />
                                        <h3 className="text-lg font-bold text-slate-800">{staffName}</h3>
                                        <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full ml-2">
                                            {docs.length} Doc{docs.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {docs.map(doc => (
                                            <div key={doc.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col gap-3 hover:border-indigo-200 hover:shadow-sm transition-all">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">From: {doc.sender_mobile}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{new Date(doc.uploaded_at).toLocaleString()}</p>
                                                    </div>
                                                    <a 
                                                        href={doc.file_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-md transition-colors border border-indigo-100 whitespace-nowrap"
                                                    >
                                                        Quick Preview
                                                    </a>
                                                </div>

                                                <div className="mt-auto pt-3 border-t border-slate-200/50">
                                                    {assigningDocId === doc.id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <select 
                                                                value={assignTargetClient}
                                                                onChange={(e) => setAssignTargetClient(e.target.value)}
                                                                className="w-full text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-amber-500"
                                                            >
                                                                <option value="">Select Client to Assign...</option>
                                                                {clients.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.business_name}</option>
                                                                ))}
                                                            </select>
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <button 
                                                                    onClick={() => {
                                                                        setAssigningDocId(null);
                                                                        setAssignTargetClient("");
                                                                    }}
                                                                    className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleAssign(doc.id)}
                                                                    disabled={!assignTargetClient || isAssigning}
                                                                    className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                                                                >
                                                                    {isAssigning ? 'Saving...' : 'Save'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAssigningDocId(doc.id)}
                                                            className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/50 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Assign to Client
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CAUnidentifiedModal;
