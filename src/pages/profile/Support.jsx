import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, Mail, MessageCircle, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileDropdown, NotificationDropdown } from '../../components/ui/HeaderDropdowns';

const Support = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [sent, setSent] = useState(false);
    
    const getBaseRoute = () => {
        const isCA = user?.role === 'ca' || user?.role === 'ca_staff' || user?.role === 'ca_article';
        return isCA ? '/ca/dashboard' : '/dashboard';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!query) return;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setQuery('');
        }, 3000);
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

                <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">Support & Help</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Contact Methods */}
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex justify-center items-center mb-4">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">Email Us</h3>
                            <p className="text-sm text-slate-500 mb-3">Response within 24 hours.</p>
                            <a href="mailto:support@vyaparos.app" className="text-sm font-bold text-[#0A2C4B] hover:underline">support@vyaparos.app</a>
                        </div>
                        
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex justify-center items-center mb-4">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1">WhatsApp Support</h3>
                            <p className="text-sm text-slate-500 mb-3">Live chat with our team.</p>
                            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-green-600 hover:underline">+91 9876543210</a>
                        </div>
                    </div>

                    {/* Query Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 h-full">
                            <h2 className="text-lg font-bold text-slate-800 mb-2">Send us a message</h2>
                            <p className="text-sm text-slate-500 mb-6">Have a specific question or issue? Let us know and we'll get back to you shortly.</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Your Query</label>
                                    <textarea 
                                        rows="5"
                                        placeholder="Describe your issue or feature request in detail..."
                                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none transition-all"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={sent || !query}
                                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold shadow-md transition-all ${sent ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-[#0A2C4B] text-white hover:bg-[#0A2C4B]/90 shadow-[#0A2C4B]/20'}`}
                                >
                                    {sent ? 'Message Sent!' : <><Send className="w-4 h-4" /> Submit Query</>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Support;
