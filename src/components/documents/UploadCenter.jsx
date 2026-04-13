import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, X, File, FileText, ImageIcon, CheckCircle2, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';

const UploadCenter = ({ businessId, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Categorization State
    const [category, setCategory] = useState('GST Purchase');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(selectedFile.type)) {
            alert('Please upload a PDF, JPG, or PNG file.');
            return;
        }
        
        // Validate size (e.g. 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || !businessId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('business_id', businessId);
        formData.append('category', category);
        formData.append('year', year);
        formData.append('month', month);

        try {
            await axios.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Reset state
            setFile(null);
            setCategory('GST Purchase');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const getFileIcon = () => {
        if (!file) return <Upload className="w-10 h-10 text-slate-400 mb-3" />;
        if (file.type.includes('pdf')) return <FileText className="w-10 h-10 text-red-500 mb-3" />;
        if (file.type.includes('image')) return <ImageIcon className="w-10 h-10 text-blue-500 mb-3" />;
        return <File className="w-10 h-10 text-slate-500 mb-3" />;
    };

    return (
        <div className="bg-white rounded-[16px] shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#F5A623]" />
                Upload Center
                <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 transition-colors cursor-help" title="Staff can use this to manually upload documents received outside of WhatsApp." />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Drag and Drop Zone */}
                <div 
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                        isDragging ? 'border-[#F5A623] bg-[#F5A623]/5' : 
                        file ? 'border-green-300 bg-green-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 cursor-pointer'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    />
                    
                    {file ? (
                        <div className="w-full relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <div className="flex flex-col items-center">
                                {getFileIcon()}
                                <p className="font-medium text-slate-800 text-sm truncate w-full px-4">{file.name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {getFileIcon()}
                            <p className="font-semibold text-slate-700">Drag & Drop file here</p>
                            <p className="text-sm text-slate-500 mt-1">or click to browse</p>
                            <p className="text-xs text-slate-400 mt-3 border bg-white px-2 py-1 rounded-md shadow-sm">Supports: PDF, JPG, PNG (Max: 10MB)</p>
                        </>
                    )}
                </div>

                {/* Categorization Form */}
                <div className={`flex flex-col justify-between ${!file ? 'opacity-50 pointer-events-none transition-opacity' : 'opacity-100'}`}>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-slate-700 text-sm border-b border-slate-100 pb-2">Document Details</h3>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]"
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
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]"
                                >
                                    <option value="2024">2024-25</option>
                                    <option value="2023">2023-24</option>
                                    <option value="2022">2022-23</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">Month (Optional)</label>
                                <input 
                                    type="month" 
                                    value={month}
                                    onChange={(e) => setMonth(e.target.value)}
                                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleUpload}
                            disabled={uploading || !file}
                            className={`w-full sm:w-auto inline-flex justify-center items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white shadow-sm transition-all ${
                                uploading || !file ? 'bg-slate-300 cursor-not-allowed' : 'bg-[#F5A623] hover:bg-[#E08A00] shadow-[#F5A623]/20'
                            }`}
                        >
                            {uploading ? 'Uploading...' : 'Upload Document'}
                            {!uploading && <Upload className="w-4 h-4 ml-1" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadCenter;
