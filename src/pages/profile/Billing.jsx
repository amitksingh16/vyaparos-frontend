import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, CreditCard, CheckCircle2, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileDropdown, NotificationDropdown } from '../../components/ui/HeaderDropdowns';

const Billing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const getBaseRoute = () => {
        const isCA = user?.role === 'ca' || user?.role === 'ca_staff' || user?.role === 'ca_article';
        return isCA ? '/ca/dashboard' : '/dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <Link to={getBaseRoute()} className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-[#F5A623]" />
                            <span className="text-xl font-bold text-[#0A2C4B] font-display">VyaparOS</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#0A2C4B] transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back
                </button>

                <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">Billing & Subscription</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#F5A623] to-[#0A2C4B]"></div>
                    <div className="p-6 md:p-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                    VyaparOS Pro <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wider"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                                </h2>
                                <p className="text-slate-500 mt-2 text-sm font-medium">Billed annually • Renewal date: Dec 31, 2026</p>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-sm text-slate-500 font-medium">Current Plan Total</p>
                                <p className="text-3xl font-bold text-slate-900 mt-1">₹4,999<span className="text-lg text-slate-400 font-medium">/yr</span></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500 mb-1">Payment Method</p>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-slate-400" />
                                    <p className="font-bold text-slate-800">•••• •••• •••• 4242</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500 mb-1">Billing Email</p>
                                <p className="font-bold text-slate-800 truncate">{user?.email || "billing@vyaparos.app"}</p>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6 flex justify-end">
                            <button className="flex items-center gap-2 bg-[#0A2C4B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0A2C4B]/90 transition-colors shadow-md shadow-[#0A2C4B]/20">
                                <Zap className="w-4 h-4" /> Upgrade Plan
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Billing;
