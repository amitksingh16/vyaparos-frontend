import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Users, Briefcase, CreditCard, Hash, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const BusinessProfile = () => {
    const navigate = useNavigate();
    const { user, fetchUser } = useAuth();
    const [loading, setLoading] = useState(false);

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
            [name]: (name === 'pan_number' || name === 'gstin') ? value.toUpperCase() : value
        });
    };

    const handleSaveFirmDetails = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const safeMobile = user?.phoneNumber || "9999999999";
            const payload = {
                ...formData,
                mobile_number: safeMobile
            };

            await axios.post('/api/ca/setup', payload);
            await fetchUser();

            // Move to Dashboard or Next Step
            navigate('/dashboard');

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message;
            alert(`Setup Error:\n${JSON.stringify(errorMsg)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Deep Space Background matching CTASection
        <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,_#0f172a_0%,_#172554_45%,_#312e81_100%)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25" />

            {/* Neon Accent Glows from Hero/CTA Section */}
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

            {/* Main Center Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="relative z-10 w-full max-w-4xl space-y-8"
            >

                {/* Branding & Header */}
                <div className="text-center space-y-4">
                    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 backdrop-blur-xl">
                        <Sparkles className="h-3.5 w-3.5" />
                        VyaparOS Workspace Setup
                    </div>
                    <h2 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                        Let's set up your firm.
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-300">
                        Create your premium control room to bring deadlines and execution into one place.
                    </p>
                </div>

                {/* Premium Frosted Glass Card matching Hero Dashboard */}
                <div className="rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                    <div className="overflow-hidden rounded-[1.55rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))]">

                        {/* Fake Mac Window Header */}
                        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-5 py-4 text-slate-300">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-rose-400" />
                                <span className="h-3 w-3 rounded-full bg-amber-400" />
                                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                            </div>
                            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                Step 1 of 3: Practice Details
                            </div>
                        </div>

                        <form onSubmit={handleSaveFirmDetails} className="p-8 sm:p-10 space-y-8">

                            {/* 1. Firm Name */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Firm Name / Practice Name</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                    <input
                                        type="text"
                                        name="firm_name"
                                        value={formData.firm_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Sharma & Associates"
                                        required
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* 2-Column Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Client Estimate</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                        <select
                                            name="total_clients"
                                            value={formData.total_clients}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-[#0f172a] text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="" className="text-slate-500">Select size...</option>
                                            <option value="1-50">1 - 50 Clients</option>
                                            <option value="51-200">51 - 200 Clients</option>
                                            <option value="200+">200+ Clients</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Portfolio Focus</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                                        <select
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-[#0f172a] text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                                        >
                                            <option value="" className="text-slate-500">Select composition...</option>
                                            <option value="Taxation">Taxation Heavy</option>
                                            <option value="Audit">Audit Heavy</option>
                                            <option value="Mixed">Mixed Portfolio</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 2-Column Grid for Tax Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">Firm PAN</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="pan_number"
                                            value={formData.pan_number}
                                            onChange={handleChange}
                                            placeholder="ABCDE1234F"
                                            maxLength="10"
                                            required
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-3">GSTIN (Optional)</label>
                                    <div className="relative">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                                        <input
                                            type="text"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                            placeholder="15-DIGIT GST NUMBER"
                                            maxLength="15"
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button matching CTA Primary */}
                            <div className="pt-6">
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 px-8 py-4 text-base font-semibold text-white shadow-[0_20px_60px_-20px_rgba(99,102,241,0.95)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        <span className="absolute -inset-2 rounded-[1.4rem] bg-gradient-to-r from-blue-500/30 via-indigo-500/35 to-fuchsia-500/30 blur-xl pointer-events-none" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {loading ? 'Securing Workspace...' : 'Create Control Room'}
                                            {!loading && <ArrowRight className="h-5 w-5" />}
                                        </span>
                                    </button>
                                </motion.div>
                            </div>

                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BusinessProfile;