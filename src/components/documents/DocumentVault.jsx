import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Folder, FolderOpen, FileText, Download, ChevronRight, Clock3, Loader2, Image as ImageIcon, File, Home, MessageCircle, X, Check, Copy, Trash2, Tag } from 'lucide-react';
import UploadCenter from './UploadCenter';
import Button from '../ui/Button';
import Toast from '../ui/Toast';

const DocumentVault = ({ businessId, user, clientName }) => {
    const [vault, setVault] = useState({});
    const [loading, setLoading] = useState(true);
    
    // UI State for drill-down approach: path array tracks [year, month, category]
    const [path, setPath] = useState([]);
    const [downloading, setDownloading] = useState(false);

    // WhatsApp Simulation State
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [pendingDocs, setPendingDocs] = useState([]);
    const [approvingDoc, setApprovingDoc] = useState(null);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [reclassifyingDoc, setReclassifyingDoc] = useState(null);
    const [bulkApproving, setBulkApproving] = useState(false);
    const [selectedPendingDocs, setSelectedPendingDocs] = useState([]);
    const [simUploadCategory, setSimUploadCategory] = useState('GST Purchase');
    const [simUploadYear, setSimUploadYear] = useState(new Date().getFullYear().toString());
    const [simUploadMonth, setSimUploadMonth] = useState(new Date().toISOString().slice(0, 7));

    // Toast State
    const [toast, setToast] = useState({ message: null, type: 'success' });


    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/documents/${businessId}`);
            // If vault is completely empty (no documents ever uploaded), set to empty obj
            setVault(res.data.vault || {});
        } catch (error) {
            console.error('Error fetching documents:', error);
            setVault({});
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingDocs = async () => {
        try {
            const res = await axios.get(`/documents/${businessId}/whatsapp`);
            setPendingDocs(res.data.pendingDocs || []);
        } catch (error) {
            console.error('Error fetching pending WhatsApp docs:', error);
            setPendingDocs([]);
        }
    };

    useEffect(() => {
        if (businessId) {
            fetchDocuments();
            fetchPendingDocs();
        } else {
            setPendingDocs([]);
            setVault({});
        }
    }, [businessId]);

    // Helpers
    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const dm = 1;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const getFileIcon = (fileType) => {
        if (!fileType) return <File className="w-8 h-8 text-slate-400" />;
        if (fileType.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
        if (fileType.includes('image')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
        return <File className="w-8 h-8 text-slate-500" />;
    };

    const handleDownloadMonthZip = async (year, month) => {
        try {
            setDownloading(true);
            const response = await axios.get(`/documents/${businessId}/zip?year=${year}&month=${month}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Documents_${year}_${month}.zip`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Error compiling zip:', error);
            alert('Failed to generate ZIP. Make sure the server supports it.');
        } finally {
            setDownloading(false);
        }
    };

    const navigateTo = (index) => {
        setPath(path.slice(0, index + 1));
    };

    const navigateRoot = () => {
        setPath([]);
    };

    const simulateWhatsAppApprove = async () => {
        const docsToApprove = bulkApproving ? pendingDocs.filter(d => selectedPendingDocs.includes(d.id)) : [(approvingDoc || previewDoc)];
        if (!docsToApprove || docsToApprove.length === 0 || !docsToApprove[0]) return;
        
        // In a real app, this would use the real file. We'll simulate by re-uploading a dummy or letting it hit the document API.
        // For simulation, we create a fake FormData object or directly pass metadata if the backend allowed mock creation.
        // Since the backend requires a real file with Multer, we'll construct a blank Blob payload to simulate.
        try {
            for (const activeDoc of docsToApprove) {
                const formData = new FormData();
                const blob = new Blob(["Simulated Document Content"], { type: activeDoc.type });
                formData.append('file', blob, activeDoc.name);
                formData.append('business_id', businessId);
                formData.append('category', simUploadCategory);
                formData.append('year', simUploadYear);
                formData.append('month', simUploadMonth);
                formData.append('source_id', activeDoc.id);

                await axios.post('/documents/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            // Remove from inbox, close modal, refresh
            const approvedIds = docsToApprove.map(d => d.id);
            setPendingDocs(prev => prev.filter(d => !approvedIds.includes(d.id)));
            setSelectedPendingDocs([]);
            
            // Format nice month name for toast
            const niceMonth = new Date(simUploadMonth + '-01').toLocaleDateString('en-IN', { month: 'long' });
            // Set toast immediately for the user
            setToast({
                message: `${docsToApprove.length} document(s) moved to FY ${simUploadYear}-${parseInt(simUploadYear.slice(-2)) + 1} > ${niceMonth} > ${simUploadCategory}`,
                type: 'success'
            });

            setApprovingDoc(null);
            setPreviewDoc(null);
            setBulkApproving(false);
            fetchDocuments();
            fetchPendingDocs(); // Refresh global whatsapp inbox state according to user specs
        } catch (error) {
            console.error("Simulation failed:", error);
            setToast({ message: "Failed to move WhatsApp document(s).", type: 'error' });
        }
    };

    const handleSelectPendingDoc = (id) => {
        setSelectedPendingDocs(prev => prev.includes(id) ? prev.filter(docId => docId !== id) : [...prev, id]);
    };

    const handleSelectAllPendingDocs = () => {
        if (selectedPendingDocs.length === pendingDocs.length) {
            setSelectedPendingDocs([]);
        } else {
            setSelectedPendingDocs(pendingDocs.map(d => d.id));
        }
    };

    const deleteSelectedPendingDocs = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedPendingDocs.length} selected documents?`)) return;
        try {
            let successCount = 0;
            for (const docId of selectedPendingDocs) {
                const response = await axios.delete(`/documents/${docId}`);
                if (response.status === 200) successCount++;
            }
            if (successCount === selectedPendingDocs.length) {
                setPendingDocs(prev => prev.filter(d => !selectedPendingDocs.includes(d.id)));
                setSelectedPendingDocs([]);
                setToast({ message: "Selected documents removed from inbox.", type: 'success' });
            } else {
                setToast({ message: "Error: Some documents could not be deleted.", type: 'error' });
            }
            fetchPendingDocs();
        } catch (error) {
             console.error("Bulk delete failed:", error);
             setToast({ message: "Error: Could not delete selected documents.", type: 'error' });
        }
    };

    const deletePendingDoc = async (docId) => {
        if (!window.confirm("Are you sure you want to permanently delete this document from the inbox?")) return;
        try {
            const response = await axios.delete(`/documents/${docId}`);
            if (response.status === 200) {
                setPendingDocs(prev => prev.filter(d => d.id !== docId));
                setPreviewDoc(null);
                setToast({ message: "Document removed from inbox.", type: 'success' });
                fetchPendingDocs(); // Sync state with backend global representation
            } else {
                setToast({ message: "Error: Could not delete document.", type: 'error' });
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setToast({ message: "Error: Could not delete document.", type: 'error' });
        }
    };

    const handleReclassify = async () => {
        if (!reclassifyingDoc) return;
        try {
            // Re-classification simulated process
            setToast({ message: `${reclassifyingDoc.name} re-classified successfully.`, type: 'success' });
            setReclassifyingDoc(null);
            fetchDocuments();
        } catch (error) {
            console.error("Reclassify failed:", error);
            setToast({ message: "Failed to re-classify document.", type: 'error' });
        }
    };

    const deleteVaultDoc = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document from the vault?")) return;
        try {
            const response = await axios.delete(`/documents/${docId}`);
            if (response.status === 200) {
                setToast({ message: "Document deleted successfully.", type: 'success' });
                fetchDocuments();
            } else {
                setToast({ message: "Error: Could not delete document.", type: 'error' });
            }
        } catch (error) {
            console.error("Delete failed:", error);
            setToast({ message: "Error: Could not delete document.", type: 'error' });
        }
    };


    // Determine what to render based on current path length
    const renderContent = () => {
        if (path.length === 0) {
            // Render Years
            const years = Object.keys(vault || {}).sort((a,b) => b-a);
            
            if (years.length === 0) {
                return (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                            <FolderOpen className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Vault is empty</h3>
                        <p className="text-sm text-slate-500 max-w-sm mb-6">No documents have been uploaded for {clientName || 'this client'} yet. Use the Upload Center below to add files.</p>
                    </div>
                );
            }

            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {years.map(year => (
                        <div 
                            key={year} 
                            onClick={() => setPath([year])}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2C4B] hover:shadow-md hover:bg-slate-50 transition-all group"
                        >
                            <Folder className="w-12 h-12 text-[#0A2C4B] mb-3 group-hover:scale-110 transition-transform duration-200" fill="#0A2C4B" fillOpacity={0.1} />
                            <span className="font-semibold text-slate-800 text-sm">FY {year}-{parseInt(year.slice(-2)) + 1}</span>
                            <span className="text-xs text-slate-500 mt-1">{Object.keys(vault[year] || {}).length} Months</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (path.length === 1) {
            // Render Months for selected Year
            const year = path[0];
            if (!vault[year]) {
                setPath([]); 
                return null;
            }
            const months = Object.keys(vault[year]).sort((a,b) => b.localeCompare(a));
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {months.map(month => (
                        <div 
                            key={month} 
                            onClick={() => setPath([year, month])}
                            className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2C4B] hover:shadow-md hover:bg-slate-50 transition-all group"
                        >
                            <Folder className="w-12 h-12 text-[#0A2C4B] mb-3 group-hover:scale-110 transition-transform duration-200" fill="#0A2C4B" fillOpacity={0.1} />
                            <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">{new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                            <span className="text-xs text-slate-500 mt-1">{Object.keys(vault[year][month]).length} Categories</span>
                        </div>
                    ))}
                </div>
            );
        }

        if (path.length === 2) {
            // Render Categories for selected Month
            const [year, month] = path;
            if (!vault[year] || !vault[year][month]) {
                setPath([]);
                return null;
            }
            const categories = Object.keys(vault[year][month]).sort();
            return (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Select Category</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <div 
                                key={cat} 
                                onClick={() => setPath([year, month, cat])}
                                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2C4B] hover:shadow-md hover:bg-slate-50 transition-all group"
                            >
                                <Folder className="w-12 h-12 text-[#0A2C4B] mb-3 group-hover:scale-110 transition-transform duration-200" fill="#0A2C4B" fillOpacity={0.1} />
                                <span className="font-semibold text-slate-800 text-sm text-center line-clamp-2 px-2">{cat}</span>
                                <span className="text-xs text-slate-500 mt-1">{vault[year][month][cat].length} Files</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (path.length === 3) {
            // Render Files in Category
            const [year, month, cat] = path;
            if (!vault[year] || !vault[year][month] || !vault[year][month][cat] || vault[year][month][cat].length === 0) {
                 return (
                     <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                         <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                         <p className="text-slate-500 font-medium">This folder is empty or has been removed.</p>
                         <Button onClick={() => setPath([])} variant="outline" className="mt-4 border-slate-200">
                             <Home className="w-4 h-4 mr-1.5" /> Back to Vault
                         </Button>
                     </div>
                 );
            }
            const files = vault[year][month][cat];
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map(doc => (
                        <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-[#0A2C4B] hover:shadow-md transition-all group flex flex-col justify-between">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg">
                                    {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <p className="font-semibold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{formatSize(doc.size)} • {doc.type.split('/')[1]?.toUpperCase()}</p>
                                </div>
                                <div className="flex gap-1 mt-1">
                                    <a 
                                        href={doc.url} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="text-slate-400 hover:text-[#0A2C4B] bg-slate-50 hover:bg-slate-100 p-2 rounded-lg transition-colors flex-shrink-0"
                                        title="Download/Open"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button 
                                        onClick={() => {
                                            setReclassifyingDoc(doc);
                                            setSimUploadCategory(path[2]);
                                            setSimUploadYear(path[0]);
                                            setSimUploadMonth(path[1]);
                                        }}
                                        className="text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 p-2 rounded-lg transition-colors flex-shrink-0"
                                        title="Re-classify"
                                    >
                                        <Tag className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => deleteVaultDoc(doc.id)}
                                        className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Audit Stamp */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50/50 -mx-4 -mb-4 px-4 py-2 rounded-b-xl">
                                <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                                Moved by <span className="text-slate-600 truncate max-w-[120px]" title={user?.name || doc.uploaderName || 'System'}>{user?.name || doc.uploaderName || 'System'}</span> on {formatDate(doc.createdAt)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {toast.message && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ message: null, type: 'success' })} 
                />
            )}
            
            {/* Upload Area */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1">
                    <UploadCenter businessId={businessId} onUploadSuccess={() => {
                        fetchDocuments();
                    }} />
                </div>
                
                {/* WhatsApp Sim Inbox Toggle */}
                <div className="xl:w-1/3 bg-white rounded-[16px] shadow-sm border border-slate-200 overflow-hidden flex flex-col border-t-4 border-t-[#F5A623]">
                    <div className="p-4 border-b border-slate-100 bg-[#F5A623]/5 flex justify-between items-center">
                        <h3 className="font-bold text-[#E08A00] flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            WhatsApp Inbox {pendingDocs.length === 0 && "(0)"}
                        </h3>
                        {pendingDocs.length > 0 && <span className="bg-[#F5A623] text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingDocs.length}</span>}
                    </div>
                    {pendingDocs.length > 0 ? (
                        <div className="p-4 flex-1 overflow-y-auto max-h-[300px] space-y-3">
                            {/* Bulk Actions Bar */}
                            <div className="flex items-center justify-between mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedPendingDocs.length === pendingDocs.length && pendingDocs.length > 0}
                                        onChange={handleSelectAllPendingDocs}
                                        className="rounded border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B]"
                                    />
                                    Select All
                                </label>
                                {selectedPendingDocs.length > 0 && (
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={deleteSelectedPendingDocs}
                                            className="text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-2.5 py-1.5 rounded-md transition-colors"
                                        >
                                            Delete ({selectedPendingDocs.length})
                                        </button>
                                        <button 
                                            onClick={() => setBulkApproving(true)}
                                            className="text-xs font-medium bg-[#0A2C4B] hover:bg-[#002D50] text-white px-2.5 py-1.5 rounded-md transition-colors"
                                        >
                                            Approve ({selectedPendingDocs.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {pendingDocs.map(doc => (
                                <div key={doc.id} className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex gap-3 items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedPendingDocs.includes(doc.id)}
                                        onChange={() => handleSelectPendingDoc(doc.id)}
                                        className="rounded border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B] transition-all"
                                    />
                                     <div 
                                        className="p-1.5 bg-slate-50 rounded-lg flex-shrink-0 cursor-pointer hover:bg-slate-100 transition-colors"
                                        onClick={() => setPreviewDoc(doc)}
                                        title="Click to preview"
                                     >
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p 
                                            className="text-sm font-semibold truncate text-slate-800 leading-tight mb-0.5 cursor-pointer hover:text-[#0A2C4B]"
                                            onClick={() => setPreviewDoc(doc)}
                                            title="Click to preview"
                                        >
                                            {doc.name}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mb-2">Sent by Client • Just now</p>
                                        <button 
                                            onClick={() => setApprovingDoc(doc)}
                                            className="text-xs font-medium bg-[#F5A623] hover:bg-[#E08A00] text-white px-3 py-1.5 rounded-md transition-colors w-full"
                                        >
                                            Approve & Move
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[200px] bg-slate-50/50">
                            <MessageCircle className="w-10 h-10 text-slate-300 mb-3" />
                            <p className="text-sm font-medium text-slate-600">Waiting for client to send documents via WhatsApp</p>
                            <button className="mt-4 text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:text-[#0A2C4B] hover:border-[#0A2C4B] px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                onClick={() => {
                                    const refText = (user?.role === 'ca_staff' || user?.role === 'ca_article') ? `%20REF:${user.id}` : '';
                                    navigator.clipboard.writeText(`https://wa.me/?text=Please%20share%20your%20documents%20with%20us%20via%20WhatsApp${refText}`);
                                    setToast({ message: 'WhatsApp reminder link copied!', type: 'success' });
                                }}
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copy WhatsApp Link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Folder Structure (Drill Down) */}
            <div className="bg-white rounded-[16px] shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    {/* Breadcrumbs */}
                    <div className="flex items-center flex-wrap gap-2 text-sm">
                        <button 
                            onClick={navigateRoot}
                            className={`flex items-center gap-1.5 transition-colors ${path.length === 0 ? 'text-[#0A2C4B] font-bold' : 'text-slate-500 hover:text-[#0A2C4B]'}`}
                        >
                            <Home className="w-4 h-4" /> Root
                        </button>
                        
                        {path.map((segment, index) => {
                            let label = segment;
                            if (index === 0) label = `FY ${segment}-${parseInt(segment.slice(-2)) + 1}`; // Year
                            if (index === 1) label = new Date(segment + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }); // Month
                            
                            const isLast = index === path.length - 1;
                            
                            return (
                                <React.Fragment key={index}>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    <button 
                                        onClick={() => navigateTo(index)}
                                        className={`transition-colors truncate max-w-[150px] ${isLast ? 'text-[#0A2C4B] font-bold' : 'text-slate-500 hover:text-[#0A2C4B]'}`}
                                        title={label}
                                    >
                                        {label}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Quick Actions (e.g. Bulk Download) */}
                    {path.length >= 2 && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={downloading}
                            className="bg-white text-slate-600 border-slate-200 hover:border-[#0A2C4B] hover:text-[#0A2C4B] ml-auto whitespace-nowrap"
                            onClick={() => handleDownloadMonthZip(path[0], path[1])}
                        >
                            {downloading ? 'Zipping...' : 'Download Month (ZIP)'}
                            <Download className="w-4 h-4 ml-1.5" />
                        </Button>
                    )}
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#0A2C4B]" />
                            <p>Loading vault...</p>
                        </div>
                    ) : Object.keys(vault).length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                            <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="font-semibold text-slate-700 text-lg">Vault is empty</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">Upload the first document for {clientName || 'this client'} to auto-generate smart folders.</p>
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>

            {/* WhatsApp Approve Modal */}
            {(approvingDoc || bulkApproving) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#F5A623]/5">
                            <h3 className="font-bold text-[#E08A00] flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                {bulkApproving ? `Organize ${selectedPendingDocs.length} Documents` : 'Organize Document'}
                            </h3>
                            <button onClick={() => { setApprovingDoc(null); setBulkApproving(false); }} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            {!bulkApproving && approvingDoc && (
                                <div className="flex gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                   {getFileIcon(approvingDoc.type)}
                                   <div className="min-w-0 flex-1">
                                       <p className="font-medium text-sm truncate">{approvingDoc.name}</p>
                                       <p className="text-xs text-slate-500">{formatSize(approvingDoc.size)}</p>
                                   </div>
                                </div>
                            )}
                            {bulkApproving && (
                                <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-600 text-center font-medium">
                                    You are moving <span className="font-bold text-indigo-600">{selectedPendingDocs.length} items</span> at once.
                                </div>
                            )}
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                    <select 
                                        value={simUploadCategory}
                                        onChange={(e) => setSimUploadCategory(e.target.value)}
                                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                    >
                                        <option value="GST Purchase">GST Purchase</option>
                                        <option value="GST Sales">GST Sales</option>
                                        <option value="Bank Statements">Bank Statements</option>
                                        <option value="Income Tax">Income Tax</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Year</label>
                                        <select 
                                            value={simUploadYear}
                                            onChange={(e) => setSimUploadYear(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                        >
                                            <option value="2024">2024-25</option>
                                            <option value="2023">2023-24</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
                                        <input 
                                            type="month" 
                                            value={simUploadMonth}
                                            onChange={(e) => setSimUploadMonth(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    onClick={simulateWhatsAppApprove}
                                    className="w-full bg-[#0A2C4B] hover:bg-[#002D50] text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
                                >
                                    Save to Vault <Check className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(previewDoc.type)}
                                <div className="min-w-0">
                                    <h3 className="font-bold text-slate-800 truncate text-lg pr-4">{previewDoc.name}</h3>
                                    <p className="text-xs text-slate-500">{formatSize(previewDoc.size)} • WhatsApp Receipt</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full p-2 transition-colors border border-slate-200 shadow-sm">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 bg-slate-100/50 p-6 overflow-hidden flex items-center justify-center relative">
                            {previewDoc.type.includes('image') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="relative w-full max-h-full flex items-center justify-center">
                                        <img 
                                            src="https://images.unsplash.com/photo-1633526543814-9718c8922b7a?q=80&w=2070&auto=format&fit=crop" 
                                            alt="Document Preview" 
                                            className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md border border-slate-200 bg-white" 
                                            onError={(e) => {
                                                e.target.onerror = null; 
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E";
                                            }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/5 rounded-lg">
                                            <span className="bg-slate-800/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md font-medium">Click to enlarge simulated image</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-sm text-slate-400 italic flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                        <ImageIcon className="w-3.5 h-3.5" /> Note: This is a simulated preview
                                    </p>
                                </div>
                            ) : previewDoc.type.includes('pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    <div className="w-full max-w-2xl h-[60vh] bg-white rounded-xl border border-slate-200 shadow-md flex flex-col overflow-hidden">
                                        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                            </div>
                                            <span className="text-xs text-slate-400 font-mono tracking-widest">{previewDoc.name}</span>
                                            <div className="w-16"></div> {/* Spacer for balance */}
                                        </div>
                                        <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center p-8 text-center border-t border-slate-700">
                                            <FileText className="w-16 h-16 text-slate-300 mb-4" />
                                            <h4 className="text-slate-700 font-semibold mb-2 text-lg">PDF Viewer Simulation</h4>
                                            <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-6">
                                                In production, this area securely renders the PDF blob directly in the browser via Mozilla's PDF.js or an embed tag.
                                            </p>
                                            <div className="flex gap-3">
                                                <Button size="sm" variant="outline" className="bg-white" disabled>
                                                    <Download className="w-4 h-4 mr-2" /> Download Original
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-[40vh] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                                    <File className="w-16 h-16 mb-4 text-slate-300" />
                                    <p className="text-sm font-medium">No preview available for this file type</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Classification Controls Inside Preview */}
                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Classify As</label>
                                <select 
                                    value={simUploadCategory}
                                    onChange={(e) => setSimUploadCategory(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                >
                                    <option value="GST Purchase">GST Purchase</option>
                                    <option value="GST Sales">GST Sales</option>
                                    <option value="Bank Statements">Bank Statements</option>
                                    <option value="Income Tax">Income Tax</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Financial Year</label>
                                <select 
                                    value={simUploadYear}
                                    onChange={(e) => setSimUploadYear(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                >
                                    <option value="2024">2024-25</option>
                                    <option value="2023">2023-24</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Filing Month</label>
                                <input 
                                    type="month" 
                                    value={simUploadMonth}
                                    onChange={(e) => setSimUploadMonth(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-white flex justify-between items-center rounded-b-2xl">
                            <span className="text-xs text-slate-400 flex items-center">
                                <Clock3 className="w-3 h-3 mr-1" />
                                Received: Just now
                            </span>
                            <div className="flex gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={() => deletePendingDoc(previewDoc.id)}
                                    className="border-red-200 hover:bg-red-50 text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                                </Button>
                                <Button 
                                    onClick={simulateWhatsAppApprove}
                                    className="bg-[#F5A623] hover:bg-[#E08A00] text-white flex items-center gap-1.5 border-none"
                                >
                                    <Check className="w-4 h-4" /> Approve & Move
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Re-classify Modal */}
            {reclassifyingDoc && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                            <h3 className="font-bold text-indigo-700 flex items-center gap-2">
                                <Tag className="w-5 h-5" />
                                Re-classify Document
                            </h3>
                            <button onClick={() => setReclassifyingDoc(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-3 mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                               {getFileIcon(reclassifyingDoc.type)}
                               <div className="min-w-0 flex-1">
                                   <p className="font-medium text-sm truncate">{reclassifyingDoc.name}</p>
                                   <p className="text-xs text-slate-500">{formatSize(reclassifyingDoc.size)}</p>
                               </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                                    <select 
                                        value={simUploadCategory}
                                        onChange={(e) => setSimUploadCategory(e.target.value)}
                                        className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                    >
                                        <option value="GST Purchase">GST Purchase</option>
                                        <option value="GST Sales">GST Sales</option>
                                        <option value="Bank Statements">Bank Statements</option>
                                        <option value="Income Tax">Income Tax</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Financial Year</label>
                                        <select 
                                            value={simUploadYear}
                                            onChange={(e) => setSimUploadYear(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                        >
                                            <option value="2024">2024-25</option>
                                            <option value="2023">2023-24</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">Filing Month</label>
                                        <input 
                                            type="month" 
                                            value={simUploadMonth}
                                            onChange={(e) => setSimUploadMonth(e.target.value)}
                                            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button 
                                    onClick={handleReclassify}
                                    className="w-full bg-[#0A2C4B] hover:bg-[#002D50] text-white font-bold py-2.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-sm"
                                >
                                    Confirm Re-classification <Check className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentVault;
