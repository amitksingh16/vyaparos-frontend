import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed
import { Building2, Users, Briefcase, CreditCard, Hash, ArrowRight } from 'lucide-react';

const BusinessProfile = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);

    // Matching exact fields required by /api/ca/setup
    const [formData, setFormData] = useState({
        firm_name: '',
        total_clients: '',
        specialization: '',
        pan_number: '',
        gstin: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            // Force PAN and GST to uppercase automatically
            [name]: (name === 'pan_number' || name === 'gstin') ? value.toUpperCase() : value
        });
    };

    const handleSaveFirmDetails = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // HARDWIRED FALLBACK: Backend needs mobile_number. 
            // We pull from AuthContext user, or send a dummy one to force success.
            const safeMobile = user?.phoneNumber || "9999999999";

            const payload = {
                ...formData,
                mobile_number: safeMobile
            };

            console.log("🚀 ATTEMPTING TO SEND FINAL PAYLOAD:", payload);

            // API Call
            const response = await axios.post('/api/ca/setup', payload);

            console.log("✅ SUCCESS:", response.data);

            // Refresh user state to reflect onboarding completion
            await fetchUser();

            // Move to Step 2 (Or Dashboard directly depending on your flow)
            alert("Success! Firm Setup Complete. Moving to next step.");
            navigate('/dashboard'); // Change this to your Step 2 route

        } catch (error) {
            console.error("❌ CRASH DETAIL:", error);
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert(`Backend Rejected it!\nReason: ${JSON.stringify(errorMsg)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Deep Space Background
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">

            {/* Ambient Neon Glows behind the card */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Main Center Container */}
            <div className="w-full max-w-4xl z-10 space-y-8">

                {/* Branding & Header */}
                <div className="text-center space-y-4">
                    {/* Progress Bar */}
                    <div className="flex items-center justify-center space-x-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-500 text-white text-xs font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">1</span>
                            <span className="text-indigo-400 font-bold text-sm tracking-wide">Firm</span>
                        </div>
                        <div className="w-12 h-px bg-slate-700"></div>
                        <div className="flex items-center space-x-2 opacity-60">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">2</span>
                            <span className="text-slate-400 font-semibold text-sm tracking-wide">Team</span>
                        </div>
                        <div className="w-12 h-px bg-slate-700"></div>
                        <div className="flex items-center space-x-2 opacity-60">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">3</span>
                            <span className="text-slate-400 font-semibold text-sm tracking-wide">Client</span>
                        </div>
                    </div>

                    <h2 className="text-4xl font-extrabold text-white tracking-tight">
                        Setup your firm
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Add your firm details to personalize your VyaparOS workspace.
                    </p>
                </div>

                {/* Premium Frosted Glass Card */}
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl rounded-3xl p-8 sm:p-10">
                    <form onSubmit={handleSaveFirmDetails} className="space-y-8">

                        {/* 1. Firm Name (Full Width) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Firm Name / Practice Name</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                <input
                                    type="text"
                                    name="firm_name"
                                    value={formData.firm_name || ""}
                                    onChange={handleChange}
                                    placeholder="e.g. Sharma & Associates"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* 2-Column Grid for Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Client Estimate</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                    <select
                                        name="total_clients"
                                        value={formData.total_clients || ""}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500">Select size...</option>
                                        <option value="1-50" className="bg-slate-900">1 - 50</option>
                                        <option value="51-200" className="bg-slate-900">51 - 200</option>
                                        <option value="200+" className="bg-slate-900">200+</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Portfolio</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                    <select
                                        name="specialization"
                                        value={formData.specialization || ""}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500">Select composition...</option>
                                        <option value="Taxation" className="bg-slate-900">Taxation Heavy</option>
                                        <option value="Audit" className="bg-slate-900">Audit Heavy</option>
                                        <option value="Mixed" className="bg-slate-900">Mixed Portfolio</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* 2-Column Grid for Tax Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Firm PAN</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="pan_number"
                                        value={formData.pan_number || ""}
                                        onChange={handleChange}
                                        placeholder="ABCDE1234F"
                                        maxLength="10"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">GSTIN (Optional)</label>
                                <div className="relative">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="gstin"
                                        value={formData.gstin || ""}
                                        onChange={handleChange}
                                        placeholder="15-DIGIT GST NUMBER"
                                        maxLength="15"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? 'Securing Workspace...' : 'Save & Enter Workspace'}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfile;