import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, User as UserIcon, Building2, Phone, Mail, Edit2, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileDropdown, NotificationDropdown } from '../../components/ui/HeaderDropdowns';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || "");

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, make an API call to update the user name
    };

    const getBaseRoute = () => {
        const isCA = user?.role === 'ca' || user?.role === 'ca_staff' || user?.role === 'ca_article';
        return isCA ? '/ca/dashboard' : '/dashboard';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Minimal Header */}
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

                <h1 className="text-2xl font-bold text-slate-900 mb-6 font-display">My Profile</h1>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 border-b border-slate-100 pb-8">
                            <div className="w-24 h-24 rounded-full bg-[#0A2C4B]/10 flex items-center justify-center border-4 border-white shadow-md flex-shrink-0">
                                <span className="text-3xl font-bold text-[#0A2C4B]">{name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-500 focus:outline-none bg-indigo-50/50 px-2 py-1 rounded-t"
                                            autoFocus
                                        />
                                    ) : (
                                        <h2 className="text-2xl font-bold text-slate-900 truncate">{name}</h2>
                                    )}
                                    
                                    <button 
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        {isEditing ? <Check className="w-5 h-5 text-green-600" /> : <Edit2 className="w-4 h-4" />}
                                    </button>
                                </div>
                                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-bold bg-[#F5A623]/20 text-[#D97D00] px-2 py-0.5 rounded shadow-sm">
                                    {user?.role?.toUpperCase() || 'USER'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Firm / Business Name
                                </p>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {user?.business_name || "VyaparOS Firm"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> Email Address
                                </p>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {user?.email || "user@example.com"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone Number
                                </p>
                                <p className="text-base font-semibold text-slate-800 pl-6">
                                    {user?.phone || "+91 9876543210"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
