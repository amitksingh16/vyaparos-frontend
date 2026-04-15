import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FirmSetupForm = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firm_name: '',
        firm_type: 'ca_firm',
        pan_number: '',
        gst_number: '',
        firm_email: '',
        firm_phone: '',
        office_address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            if (onSuccess) {
                onSuccess();
            }
        }, 800);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-[#0A2C4B] to-[#0A2C4B]/90">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                                <Building2 className="w-5 h-5 text-white/80" />
                                Setup Your Firm
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <p className="text-sm text-slate-500 mb-6">
                                Add your firm details to personalize your workspace. This information helps us configure your environment.
                            </p>

                            <form id="firm-setup-form" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Firm Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Acme Associates"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Firm Type
                                    </label>
                                    <select
                                        name="firm_type"
                                        value={formData.firm_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all bg-white"
                                    >
                                        <option value="ca_firm">CA Firm</option>
                                        <option value="individual">Individual Practitioner</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Firm Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="firm_email"
                                            value={formData.firm_email}
                                            onChange={handleChange}
                                            required
                                            placeholder="contact@firm.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            Firm Phone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            name="firm_phone"
                                            value={formData.firm_phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="9876543210"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            PAN Number
                                        </label>
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={formData.pan_number}
                                            onChange={handleChange}
                                            placeholder="ABCDE1234F"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all uppercase"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                                            GST Number
                                        </label>
                                        <input
                                            type="text"
                                            name="gst_number"
                                            value={formData.gst_number}
                                            onChange={handleChange}
                                            placeholder="22AAAAA0000A1Z5"
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">
                                        Office Address
                                    </label>
                                    <textarea
                                        name="office_address"
                                        value={formData.office_address}
                                        onChange={handleChange}
                                        placeholder="123 Business Avenue, Block A..."
                                        rows="2"
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all resize-none"
                                    ></textarea>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="firm-setup-form"
                                disabled={loading}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none"
                            >
                                {loading ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FirmSetupForm;
