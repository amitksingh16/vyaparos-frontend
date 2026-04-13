import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, User as UserIcon, LogOut, Settings, ChevronRight, Activity, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Custom hook to detect clicks outside of a component
function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

export const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef();
    
    useOnClickOutside(ref, () => setIsOpen(false));

    useEffect(() => {
        if (!isOpen) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/notifications');
                setNotifications(Array.isArray(res.data) ? res.data : (res.data?.notifications || []));
            } catch (error) {
                console.error('Failed to fetch notifications', error);
                setNotifications([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [isOpen]);

    const getNotificationAppearance = (notification) => {
        const type = notification.type || notification.severity || notification.level || 'info';

        if (type === 'alert' || type === 'error' || type === 'critical') {
            return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' };
        }

        if (type === 'warning') {
            return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
        }

        return { icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' };
    };

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
                            {loading ? 'Loading' : `${notifications.length} New`}
                        </span>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="px-5 py-8 text-center text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-medium">Loading notifications...</p>
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const { icon: Icon, color, bg } = getNotificationAppearance(notif);
                                return (
                                    <div key={notif.id} className="px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3">
                                        <div className={`mt-0.5 w-8 h-8 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-4 h-4 ${color}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                {notif.title || 'Notification'}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                                {notif.message || notif.description || 'No details available.'}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                                                {notif.time || notif.created_at || notif.createdAt || 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-5 py-8 text-center text-slate-500">
                                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-sm font-medium">No new notifications</p>
                            </div>
                        )}
                    </div>
                    
                    {notifications.length > 0 && (
                        <div className="px-3 pt-2 pb-1">
                        <button 
                            className="w-full text-center text-sm font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 py-2 rounded-xl transition-colors flex items-center justify-center gap-1"
                            onClick={() => setIsOpen(false)}
                        >
                            View all notifications <ChevronRight className="w-4 h-4" />
                        </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export const ProfileDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const ref = useRef();
    
    useOnClickOutside(ref, () => setIsOpen(false));

    const handleLogout = () => {
        setIsOpen(false);
        logout();
        navigate('/login');
    };

    const firmName = user?.business_name || "VyaparOS Firm";
    const userName = user?.name || "Professional";
    
    let roleLabel = 'User';
    if (user?.role === 'ca') roleLabel = 'Firm Owner';
    else if (user?.role === 'ca_staff') roleLabel = 'Senior Staff';
    else if (user?.role === 'ca_article') roleLabel = 'Article Assistant';
    else if (user?.role === 'owner') roleLabel = 'Business Owner';
    else if (user?.role === 'staff') roleLabel = 'Staff Member';



    return (
        <div className="relative flex items-center" ref={ref}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 p-1 rounded-full hover:bg-slate-50 transition-colors group cursor-pointer"
                title="Profile & Settings"
            >
                <div className="w-9 h-9 rounded-full bg-[#0A2C4B]/10 flex items-center justify-center border border-[#0A2C4B]/20 group-hover:border-[#0A2C4B]/40 transition-colors">
                    <UserIcon className="w-5 h-5 text-[#0A2C4B]" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-[110%] mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0A2C4B] flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0 cursor-default">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 cursor-default">
                            <p className="text-sm font-bold text-slate-900 truncate" title={userName}>{userName}</p>
                            <p className="text-xs font-semibold text-slate-500 truncate mt-0.5" title={firmName}>{firmName}</p>
                            <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-bold bg-[#F5A623]/20 text-[#D97D00] px-1.5 py-0.5 rounded shadow-sm">
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-2">
                        <button 
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                            onClick={() => {
                                setIsOpen(false);
                                navigate('/settings');
                            }}
                        >
                            <Settings className="w-4 h-4 text-slate-400" />
                            Account Settings
                        </button>
                    </div>
                    
                    <div className="p-2 border-t border-slate-100">
                        <button 
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
