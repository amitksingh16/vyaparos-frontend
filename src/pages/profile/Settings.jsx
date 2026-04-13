import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, Bell, MessageSquare, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileDropdown, NotificationDropdown } from '../../components/ui/HeaderDropdowns';

const Settings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Local state for demo toggles
    const [whatsappAlerts, setWhatsappAlerts] = useState(true);
    const [emailDigest, setEmailDigest] = useState(false);

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

                <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">Account Settings</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="mb-6 border-b border-slate-100 pb-4">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-500" /> Notification Preferences
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Manage how and when you receive alerts from VyaparOS.</p>
                        </div>
                        
                        <div className="space-y-6">
                            {/* WhatsApp Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg shrink-0 mt-0.5">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">WhatsApp Alerts</h3>
                                        <p className="text-xs text-slate-500 mt-1">Receive instance notifications for imminent deadlines and chat updates.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={whatsappAlerts}
                                        onChange={() => setWhatsappAlerts(!whatsappAlerts)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                            </div>

                            {/* Email Toggle */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">Email Digest</h3>
                                        <p className="text-xs text-slate-500 mt-1">Receive a weekly summary of pending compliances and activity logs.</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={emailDigest}
                                        onChange={() => setEmailDigest(!emailDigest)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
