import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import CountUp from 'react-countup';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// framer-motion removed
import { Shield, Bell, User as UserIcon, Users, CheckCircle2, AlertCircle, AlertTriangle, ChevronRight, Activity, Plus, Search, X, ChevronUp, ChevronDown, CheckSquare, Trash2, Check, Calendar, TrendingDown, Sparkles, FileText, ClipboardList, Info, History, AlertOctagon, Send, MessageCircle } from 'lucide-react';

import AddClientModal from '../../components/ca/AddClientModal';
import CATeamManagement from '../../components/ca/CATeamManagement';
import ReassignClientModal from '../../components/ca/ReassignClientModal';
import CAUnidentifiedModal from '../../components/ca/CAUnidentifiedModal';
import ReviewDocumentsModal from '../../components/ca/ReviewDocumentsModal';
import EmptyStateCard from '../../components/ca/EmptyStateCard';
import OnboardingSetupModal from '../../components/ca/OnboardingSetupModal';
import OnboardingProgressBanner from '../../components/ca/OnboardingProgressBanner';
import { NotificationDropdown, ProfileDropdown } from '../../components/ui/HeaderDropdowns';

// Utility to convert timestamp to relative generic time
const timeAgo = (dateParams) => {
    const date = new Date(dateParams);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return interval + (interval === 1 ? " year ago" : " years ago");
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval + (interval === 1 ? " month ago" : " months ago");
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval + (interval === 1 ? " day ago" : " days ago");
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval + (interval === 1 ? " hour ago" : " hours ago");
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval + (interval === 1 ? " min ago" : " mins ago");
    return "Just now";
};

const highlightMatch = (text, query) => {
    if (!query) return text;
    // Escape special characters to avoid breaking regex
    const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-[#E08A00]/20 text-[#002D50] font-bold rounded px-0.5">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};

const PortfolioStatCard = ({
    title,
    value,
    icon,
    tone,
    isActive,
    onClick,
    loading,
}) => {
    const toneClasses = {
        blue: {
            card: 'from-blue-50 via-white to-sky-50 border-blue-100/80',
            active: 'ring-blue-500/20 border-blue-200 shadow-blue-200/50',
            icon: 'bg-blue-600 text-white',
            idleIcon: 'bg-blue-100 text-blue-700',
            orb: 'bg-blue-400/20',
        },
        green: {
            card: 'from-emerald-50 via-white to-green-50 border-emerald-100/80',
            active: 'ring-emerald-500/20 border-emerald-200 shadow-emerald-200/50',
            icon: 'bg-emerald-600 text-white',
            idleIcon: 'bg-emerald-100 text-emerald-700',
            orb: 'bg-emerald-400/20',
        },
        orange: {
            card: 'from-amber-50 via-white to-orange-50 border-amber-100/80',
            active: 'ring-amber-500/20 border-amber-200 shadow-amber-200/50',
            icon: 'bg-amber-600 text-white',
            idleIcon: 'bg-amber-100 text-amber-700',
            orb: 'bg-amber-400/20',
        },
        red: {
            card: 'from-rose-50 via-white to-red-50 border-rose-100/80',
            active: 'ring-red-500/20 border-red-200 shadow-red-200/50',
            icon: 'bg-red-600 text-white',
            idleIcon: 'bg-red-100 text-red-700',
            orb: 'bg-red-400/20',
        },
    };

    const classes = toneClasses[tone];

    return (
        <button
            onClick={onClick}
            className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-5 text-left shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_30px_70px_-34px_rgba(15,23,42,0.35)] focus:outline-none focus:ring-2 ${classes.card} ${isActive ? `ring-2 ${classes.active}` : 'border-slate-200/80'}`}
        >
            <div className={`absolute -right-6 -top-8 h-24 w-24 rounded-full blur-2xl transition-transform duration-200 group-hover:scale-110 ${classes.orb}`} />
            <div className="relative flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</div>
                    <div className="mt-3 text-4xl font-bold tracking-[-0.04em] text-slate-900 font-display">
                        {loading ? '-' : <CountUp end={value} duration={0.8} preserveValue />}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-500">
                        {loading ? 'Loading insights...' : value === 0 ? 'No data yet' : 'Live compliance snapshot'}
                    </div>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm transition-all duration-200 ${isActive ? classes.icon : classes.idleIcon}`}>
                    {React.createElement(icon, { className: 'h-5 w-5' })}
                </div>
            </div>
        </button>
    );
};

const CADashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [dashboardData, setDashboardData] = useState({
        stats: { total: 0, healthy: 0, attention: 0, critical: 0 },
        clients: []
    });

    const [unidentifiedDocs, setUnidentifiedDocs] = useState([]);
    const [assigningDocId, setAssigningDocId] = useState(null);
    const [assignTargetClient, setAssignTargetClient] = useState("");

    const [reviewClientDocs, setReviewClientDocs] = useState(null);

    const [reassignModal, setReassignModal] = useState({
        isOpen: false,
        clientId: null,
        currentAssignedTo: null,
        clientName: ''
    });

    const [team, setTeam] = useState([]);
    const [selectedBulkStaff, setSelectedBulkStaff] = useState('');

    const [visibleCount, setVisibleCount] = useState(15);
    const [activeTab, setActiveTab] = useState('portfolio');
    const [showOnboardingModal, setShowOnboardingModal] = useState(false);
    const [onboardingDismissed, setOnboardingDismissed] = useState(false);
    const [onboardingInProgress, setOnboardingInProgress] = useState(false);
    const [inviteModalSignal, setInviteModalSignal] = useState(0);
    let displayName = user?.name || "User";
    if (displayName.toLowerCase().endsWith(' staff')) {
        displayName = displayName.substring(0, displayName.length - 6).trim();
    }
    
    let roleBadge = "Staff Member";
    let badgeColor = "bg-slate-50 text-slate-700 border-slate-200";

    if (user?.role === 'ca') {
        displayName = user?.business_name || displayName;
        roleBadge = "Firm Owner";
        badgeColor = "text-[#F5A623] bg-amber-50 border-amber-200";
    } else if (user?.role === 'ca_staff') {
        roleBadge = "Senior Staff";
        badgeColor = "text-indigo-600 bg-indigo-50 border-indigo-200";
    } else if (user?.role === 'ca_article') {
        roleBadge = "Article Assistant";
        badgeColor = "text-blue-600 bg-blue-50 border-blue-200";
    }

    // Risk filter state
    const [riskFilter, setRiskFilter] = useState('All');

    // Smart Alert state
    const [activeSmartAlert, setActiveSmartAlert] = useState(null);

    // Sort state: default health ascending
    const [sortConfig, setSortConfig] = useState({ key: 'compliance_health', direction: 'asc' });

    // Bulk action state
    const [selectedClients, setSelectedClients] = useState([]);
    const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
    const [showUnidentifiedModal, setShowUnidentifiedModal] = useState(false);

    // userName defined above

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Compute counts dynamically
    const filterCounts = useMemo(() => {
        const counts = { All: 0, Critical: 0, Attention: 0, Healthy: 0 };
        dashboardData.clients.forEach(client => {
            counts.All++;
            if (client.compliance_health < 50) counts.Critical++;
            else if (client.compliance_health <= 79) counts.Attention++;
            else counts.Healthy++;
        });
        return counts;
    }, [dashboardData.clients]);

    // Compute Smart Alert metrics
    const smartAlerts = useMemo(() => {
        let overdueCount = 0;
        let upcomingCount = 0;
        let healthDropCount = 0;

        dashboardData.clients.forEach(client => {
            if (client.overdue_count > 0) overdueCount++;
            if (client.pending_count > 0) upcomingCount++;
            // If logic: client health < 50, consider it a health drop alert
            if (client.compliance_health < 50) healthDropCount++;
        });

        return { overdueCount, upcomingCount, healthDropCount };
    }, [dashboardData.clients]);

    const filteredClients = dashboardData.clients.filter(client => {
        // 1. Text Search Filter
        const query = debouncedQuery.toLowerCase();
        let matchesSearch = true;
        if (query) {
            matchesSearch = client.business_name.toLowerCase().includes(query) ||
                client.filing_type.toLowerCase().includes(query) ||
                (client.assigned_to_name && client.assigned_to_name.toLowerCase().includes(query));
        }

        // 2. Risk Segment Filter
        let matchesRisk = true;
        if (riskFilter === 'Critical') matchesRisk = client.compliance_health < 50;
        else if (riskFilter === 'Attention') matchesRisk = client.compliance_health >= 50 && client.compliance_health <= 79;
        else if (riskFilter === 'Healthy') matchesRisk = client.compliance_health >= 80;

        // 3. Smart Alert Filter
        let matchesSmartAlert = true;
        if (activeSmartAlert === 'overdue') matchesSmartAlert = client.overdue_count > 0;
        else if (activeSmartAlert === 'upcoming') matchesSmartAlert = client.pending_count > 0;
        else if (activeSmartAlert === 'health_drop') matchesSmartAlert = client.compliance_health < 50;

        return matchesSearch && matchesRisk && matchesSmartAlert;
    });

    // Apply Sorting
    const sortedAndFilteredClients = useMemo(() => {
        let sortableClients = [...filteredClients];
        if (sortConfig !== null) {
            sortableClients.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle dates for last_activity
                if (sortConfig.key === 'last_activity') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableClients;
    }, [filteredClients, sortConfig]);

    const visibleClients = sortedAndFilteredClients.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 15);
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig?.key !== key) return null;
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1 inline text-[#002D50]" strokeWidth={2.5} /> : <ChevronDown className="w-4 h-4 ml-1 inline text-[#002D50]" strokeWidth={2.5} />;
    };

    const SortableHeader = ({ label, sortKey, align = "left" }) => {
        const isActive = sortConfig?.key === sortKey;
        return (
            <th
                className={`px-6 py-4 cursor-pointer group transition-all duration-150 select-none ${isActive ? 'bg-slate-100 text-[#0A2C4B] font-semibold' : 'hover:bg-slate-50 text-slate-500 font-medium'} ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
                onClick={() => handleSort(sortKey)}
            >
                <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                    <span>{label}</span>
                    <span className={`w-5 flex items-center justify-center transition-all duration-150 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                        {isActive ? getSortIcon(sortKey) : <ChevronUp className="w-4 h-4 ml-1 text-slate-400" strokeWidth={2.5} />}
                    </span>
                </div>
            </th>
        );
    };

    const fetchCADashboard = async () => {
        try {
            setLoading(true);
            const [res, teamRes, unidentRes] = await Promise.all([
                axios.get('/ca/dashboard'),
                axios.get('/ca/team'),
                axios.get('/documents/unidentified').catch(() => ({ data: { documents: [] } }))
            ]);

            // Ensure unique clients based on business id
            const uniqueClientsMap = new Map();
            if (Array.isArray(res.data?.clients)) {
                res.data.clients.forEach(client => {
                    uniqueClientsMap.set(client.id, client);
                });
            }

            setDashboardData({
                stats: {
                    total: res.data?.stats?.total ?? 0,
                    healthy: res.data?.stats?.healthy ?? 0,
                    attention: res.data?.stats?.attention ?? 0,
                    critical: res.data?.stats?.critical ?? 0
                },
                clients: Array.from(uniqueClientsMap.values())
            });
            
            setTeam(Array.isArray(teamRes.data) ? teamRes.data : []);
            setUnidentifiedDocs(Array.isArray(unidentRes?.data?.documents) ? unidentRes.data.documents : []);
        } catch (err) {
            console.error("Error fetching CA dashboard data", err);
            setDashboardData({
                stats: { total: 0, healthy: 0, attention: 0, critical: 0 },
                clients: []
            });
            setTeam([]);
            setUnidentifiedDocs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCADashboard();
    }, []);

    const handleClientAdded = () => {
        setShowAddModal(false);
        setShowOnboardingModal(false);
        setOnboardingInProgress(false);
        fetchCADashboard();
    };

    const handleAssignUnidentifiedDoc = async (docId) => {
        if (!assignTargetClient) return;
        try {
            await axios.put(`/documents/unidentified/${docId}/assign`, {
                business_id: assignTargetClient
            });
            // Remove from list
            setUnidentifiedDocs(prev => prev.filter(d => d.id !== docId));
            setAssigningDocId(null);
            setAssignTargetClient("");
        } catch (err) {
            console.error("Error assigning document", err);
            alert("Failed to assign document");
        }
    };

    const handleViewClient = (businessId) => {
        navigate(`/ca/client/${businessId}`);
    };

    // Bulk Action Handlers
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedClients(sortedAndFilteredClients.map(client => client.id));
        } else {
            setSelectedClients([]);
        }
    };

    const handleSelectClient = (clientId) => {
        setSelectedClients(prev => {
            if (prev.includes(clientId)) {
                return prev.filter(id => id !== clientId);
            } else {
                return [...prev, clientId];
            }
        });
    };

    const handleBulkAction = async (action) => {
        if (selectedClients.length === 0) return;

        setIsBulkActionLoading(true);
        try {
            if (action === 'assign_staff') {
                await axios.put('/ca/clients/bulk-assign', {
                    clientIds: selectedClients,
                    assign_to: selectedBulkStaff || null
                });
            } else {
                // Handle other actions here if implemented in the future
                await new Promise(resolve => setTimeout(resolve, 600));
            }

            // Refresh data and clear selection
            fetchCADashboard();
            setSelectedClients([]);
            setSelectedBulkStaff('');
        } catch (err) {
            console.error(`Error performing bulk action ${action}`, err);
            // In a real app, you'd show an error toast here
            alert("Failed to perform bulk action.");
        } finally {
            setIsBulkActionLoading(false);
        }
    };

    const isAllSelected = sortedAndFilteredClients.length > 0 && selectedClients.length === sortedAndFilteredClients.length;
    const isIndeterminate = selectedClients.length > 0 && selectedClients.length < sortedAndFilteredClients.length;
    const totalClients = dashboardData.clients.length;
    const teamMembers = team.length;
    const completedSetupSteps = (teamMembers > 0 ? 1 : 0) + (totalClients > 0 ? 1 : 0);
    const onboardingStep = teamMembers > 0 ? 2 : 1;
    const onboardingPercent = Math.round((completedSetupSteps / 2) * 100);
    const showOnboardingBanner = user?.role === 'ca' && completedSetupSteps < 2;

    useEffect(() => {
        if (user?.role !== 'ca' || loading || onboardingDismissed) return;

        if (totalClients === 0 && (teamMembers === 0 || onboardingInProgress)) {
            setShowOnboardingModal(true);
            setOnboardingInProgress(true);
            return;
        }

        if (totalClients > 0) {
            setShowOnboardingModal(false);
            setOnboardingInProgress(false);
        }
    }, [loading, onboardingDismissed, onboardingInProgress, teamMembers, totalClients, user?.role]);

    const handleDismissOnboarding = () => {
        setShowOnboardingModal(false);
        setOnboardingDismissed(true);
        setOnboardingInProgress(false);
    };

    const handleOpenInviteTeam = () => {
        setShowOnboardingModal(false);
        setOnboardingInProgress(true);
        setActiveTab('team');
        setInviteModalSignal(prev => prev + 1);
    };

    const handleOpenAddClient = () => {
        setShowOnboardingModal(false);
        setOnboardingInProgress(true);
        setOnboardingDismissed(false);
        setActiveTab('portfolio');
        setShowAddModal(true);
    };

    const handleTeamMemberAdded = () => {
        setOnboardingDismissed(false);
        setOnboardingInProgress(true);
        setShowOnboardingModal(true);
    };

    const handleContinueSetup = () => {
        setOnboardingDismissed(false);
        setShowOnboardingModal(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-[#0F5C4A]" />
                            <span className="text-xl font-bold text-[#0A2C4B] font-display">VyaparOS <span className="text-[#F5A623] text-sm font-semibold ml-1 bg-[#F5A623]/10 px-2 py-0.5 rounded-full">CA Dashboard</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Sticky Bulk Action Bar */}
            <div
                className={`fixed top-16 left-0 right-0 z-20 transform transition-all duration-200 ease-out border-b border-indigo-900/10 shadow-md ${selectedClients.length > 0 ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
                    }`}
            >
                <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-md border-t border-indigo-500/20"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                            <span className="bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                {selectedClients.length}
                            </span>
                            <span className="text-sm font-medium text-slate-200">
                                Selected
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedClients([])}
                            className="text-sm font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                        >
                            Cancel
                        </button>

                        <div className="h-4 w-px bg-slate-700"></div>

                        {/* Primary Action */}
                        <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
                            <select
                                value={selectedBulkStaff}
                                onChange={(e) => setSelectedBulkStaff(e.target.value)}
                                className="bg-slate-700/50 text-slate-200 text-sm font-medium border border-slate-600/50 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500/50 w-40"
                            >
                                <option value="">Unassigned</option>
                                {team.map(member => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => handleBulkAction('assign_staff')}
                                disabled={isBulkActionLoading}
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg transition-all shadow-sm shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                <UserIcon className="w-4 h-4" />
                                Assign Staff
                            </button>
                        </div>

                        {/* Other Actions */}
                        <button
                            onClick={() => handleBulkAction('mark_filed')}
                            disabled={isBulkActionLoading}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-200 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-4 py-1.5 rounded-lg transition-all border border-slate-600/50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap hidden sm:flex"
                        >
                            <CheckSquare className="w-4 h-4" />
                            Mark Filed
                        </button>

                        {/* Danger Action */}
                        <button
                            onClick={() => handleBulkAction('archive')}
                            disabled={isBulkActionLoading}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/30 px-3 py-1.5 rounded-lg transition-colors ml-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Archive</span>
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* 1. Welcome Section */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-slate-900 leading-tight flex items-center gap-3">
                            Welcome, {displayName}
                        </h1>
                        <div className="mt-2 mb-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${badgeColor}`}>
                                {roleBadge}
                            </span>
                        </div>
                        <p className="text-slate-500 mt-2">
                            {activeTab === 'portfolio' 
                                ? "Here's an overview of your clients' compliance health"
                                : "Manage your firm's staff, articles, and their assigned portfolios"}
                        </p>
                    </div>
                    {user?.role === 'ca' && activeTab === 'team' ? null : (
                        <button
                            onClick={() => setShowAddModal(true)}
                            disabled={selectedClients.length > 0}
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] text-white font-medium shadow-sm transition-all duration-200 ease-in-out whitespace-nowrap ${selectedClients.length > 0
                                ? 'opacity-50 pointer-events-none'
                                : 'hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)] focus:ring-2 focus:ring-[#0A2C4B]/20'
                                }`}
                        >
                            <Plus className="w-5 h-5" />
                            Add Client
                        </button>
                    )}
                </div>

                {showOnboardingBanner && (
                    <>
                        <OnboardingProgressBanner
                            completedSteps={completedSetupSteps}
                            totalSteps={2}
                            percentComplete={onboardingPercent}
                            onContinue={handleContinueSetup}
                        />
                        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm">
                            <span className="font-semibold">Tip:</span> Invite your team first to distribute workload efficiently and keep client follow-ups moving.
                        </div>
                    </>
                )}

                {/* Inline Tab Navigation for CA Owners */}
                {user?.role === 'ca' && (
                    <div className="flex space-x-8 border-b border-slate-200 mb-8">
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'portfolio' ? 'border-[#0A2C4B] text-[#0A2C4B]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            Client Portfolio
                        </button>
                        <button
                            onClick={() => setActiveTab('team')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'team' ? 'border-[#0A2C4B] text-[#0A2C4B]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                        >
                            <Users className="w-4 h-4" />
                            Team Management
                            {unidentifiedDocs.length > 0 && (
                                <span 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowUnidentifiedModal(true);
                                    }}
                                    className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 animate-pulse hover:bg-amber-600 transition-colors cursor-pointer"
                                >
                                    {unidentifiedDocs.length} Unidentified
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {activeTab === 'portfolio' ? (
                    <>
                        {/* Unidentified Inbox (Staff Only) */}
                        {unidentifiedDocs.length > 0 && user?.role !== 'ca' && (
                            <div className="mb-8">
                                <div className="bg-amber-50 rounded-2xl p-5 shadow-sm border border-amber-200">
                                    <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                                        Unidentified Inbox ({unidentifiedDocs.length})
                                    </h2>
                                    <p className="text-sm text-amber-700 mb-4">
                                        These documents were received via WhatsApp from unmapped numbers. Please review and assign them to the correct client profile.
                                    </p>
                                    <div className="space-y-3">
                                        {unidentifiedDocs.map(doc => (
                                            <div key={doc.id} className="bg-white rounded-xl p-4 border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 text-sm truncate max-w-xs">{doc.name}</p>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                                                                From: {doc.sender_mobile}
                                                            </span>
                                                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                            <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <a 
                                                        href={doc.file_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100"
                                                    >
                                                        View
                                                    </a>
                                                    
                                                    {assigningDocId === doc.id ? (
                                                        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                                            <select 
                                                                value={assignTargetClient}
                                                                onChange={(e) => setAssignTargetClient(e.target.value)}
                                                                className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white outline-none focus:ring-2 focus:ring-amber-500 max-w-[150px] sm:max-w-[200px]"
                                                            >
                                                                <option value="">Select Client...</option>
                                                                {dashboardData.clients.map(c => (
                                                                    <option key={c.id} value={c.id}>{c.business_name}</option>
                                                                ))}
                                                            </select>
                                                            <button 
                                                                onClick={() => handleAssignUnidentifiedDoc(doc.id)}
                                                                disabled={!assignTargetClient}
                                                                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                                            >
                                                                Save
                                                            </button>
                                                            <button 
                                                                onClick={() => {
                                                                    setAssigningDocId(null);
                                                                    setAssignTargetClient("");
                                                                }}
                                                                className="text-slate-500 hover:text-slate-700 p-1.5 rounded-md hover:bg-slate-200"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setAssigningDocId(doc.id)}
                                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Assign to Client
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Stats Grid */}
                        <div className="mb-8 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <PortfolioStatCard
                                title="Total Clients"
                                value={dashboardData.stats.total}
                                icon={Users}
                                tone="blue"
                                isActive={riskFilter === 'All'}
                                onClick={() => setRiskFilter('All')}
                                loading={loading}
                            />
                            <PortfolioStatCard
                                title="Healthy Clients"
                                value={dashboardData.stats.healthy}
                                icon={CheckCircle2}
                                tone="green"
                                isActive={riskFilter === 'Healthy'}
                                onClick={() => setRiskFilter('Healthy')}
                                loading={loading}
                            />
                            <PortfolioStatCard
                                title="Attention Needed"
                                value={dashboardData.stats.attention}
                                icon={AlertCircle}
                                tone="orange"
                                isActive={riskFilter === 'Attention'}
                                onClick={() => setRiskFilter('Attention')}
                                loading={loading}
                            />
                            <PortfolioStatCard
                                title="Critical Priority"
                                value={dashboardData.stats.critical}
                                icon={AlertTriangle}
                                tone="red"
                                isActive={riskFilter === 'Critical'}
                                onClick={() => setRiskFilter('Critical')}
                                loading={loading}
                            />
                        </div>

                        {/* Smart Alerts Strip */}
                        {(smartAlerts.overdueCount > 0 || smartAlerts.upcomingCount > 0 || smartAlerts.healthDropCount > 0) && (
                            <div className="mb-6 flex flex-wrap gap-3 items-center">
                                <span className="text-sm font-semibold text-slate-500 mr-2 flex items-center gap-1.5">
                                    <Bell className="w-4 h-4" />
                                    Smart Alerts:
                                </span>

                                {smartAlerts.overdueCount > 0 && (
                                    <button
                                        onClick={() => setActiveSmartAlert(activeSmartAlert === 'overdue' ? null : 'overdue')}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeSmartAlert === 'overdue'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ring-2 ring-amber-500/20'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100 hover:border-amber-300'
                                            }`}
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        Overdue Clients
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeSmartAlert === 'overdue' ? 'bg-amber-800 text-white' : 'bg-amber-200 text-amber-800'}`}>
                                            {smartAlerts.overdueCount}
                                        </span>
                                    </button>
                                )}

                                {smartAlerts.upcomingCount > 0 && (
                                    <button
                                        onClick={() => setActiveSmartAlert(activeSmartAlert === 'upcoming' ? null : 'upcoming')}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeSmartAlert === 'upcoming'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm ring-2 ring-blue-500/20'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200/50 hover:bg-blue-100 hover:border-blue-300'
                                            }`}
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Upcoming Deadlines
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeSmartAlert === 'upcoming' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800'}`}>
                                            {smartAlerts.upcomingCount}
                                        </span>
                                    </button>
                                )}

                                {smartAlerts.healthDropCount > 0 && (
                                    <button
                                        onClick={() => setActiveSmartAlert(activeSmartAlert === 'health_drop' ? null : 'health_drop')}
                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeSmartAlert === 'health_drop'
                                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 shadow-sm ring-2 ring-indigo-500/20'
                                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50 hover:bg-indigo-100 hover:border-indigo-300'
                                            }`}
                                    >
                                        <TrendingDown className="w-4 h-4" />
                                        Health Score Drop
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${activeSmartAlert === 'health_drop' ? 'bg-indigo-800 text-white' : 'bg-indigo-200 text-indigo-800'}`}>
                                            {smartAlerts.healthDropCount}
                                        </span>
                                    </button>
                                )}

                                {activeSmartAlert && (
                                    <button
                                        onClick={() => setActiveSmartAlert(null)}
                                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors ml-2 hover:bg-slate-100 px-2 py-1 rounded-md"
                                    >
                                        <X className="w-3 h-3" /> Clear Filter
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 3. Client List Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col mt-4">
                            <div className="px-6 py-5 border-b border-slate-100 flex flex-col gap-5 bg-white">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-[#0F5C4A]" />
                                        Client Portfolio
                                    </h2>
                                    <div className="relative w-full sm:w-72">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search clients..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-100 placeholder-slate-500 font-medium hover:border-[#0A2C4B] text-sm focus:outline-none focus:border-[#0A2C4B] focus:ring-4 focus:ring-[#0A2C4B]/10 transition-all shadow-sm"
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Risk Filters */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {['All', 'Critical', 'Attention', 'Healthy'].map((filter) => {
                                        const isActive = riskFilter === filter;
                                        return (
                                            <button
                                                key={filter}
                                                onClick={() => setRiskFilter(filter)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${isActive
                                                    ? 'bg-[#0A2C4B] border-[#0A2C4B] text-white shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {filter} <span className={isActive ? 'text-white/80' : 'text-slate-400'}>({filterCounts[filter]})</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider select-none">
                                            <th className="px-6 py-4 w-12">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B] transition-colors cursor-pointer"
                                                    checked={isAllSelected}
                                                    ref={input => {
                                                        if (input) input.indeterminate = isIndeterminate;
                                                    }}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="px-4 py-4 font-semibold text-left">Business Name</th>
                                            <th className="px-6 py-4 font-semibold text-left">Filing Type</th>
                                            {user?.role === 'ca' ? (
                                                <SortableHeader label="Assigned To" sortKey="assigned_to_name" align="left" />
                                            ) : (
                                                <th className="px-6 py-4 font-semibold text-left">Contact</th>
                                            )}
                                            <SortableHeader label="Health" sortKey="compliance_health" align="center" />
                                            <SortableHeader label="Task Completion" sortKey="pending_count" align="center" />
                                            <SortableHeader label="Overdue" sortKey="overdue_count" align="center" />
                                            <SortableHeader label="Last Activity" sortKey="last_activity" align="center" />
                                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                                                    Loading clients data...
                                                </td>
                                            </tr>
                                        ) : visibleClients.length > 0 ? (
                                            visibleClients.map((client) => {
                                                let healthColorClass = "";
                                                let healthBgClass = "";

                                                if (client.compliance_health >= 80) {
                                                    healthColorClass = "text-green-700";
                                                    healthBgClass = "bg-green-50/80";
                                                } else if (client.compliance_health >= 50) {
                                                    healthColorClass = "text-[#E08A00]";
                                                    healthBgClass = "bg-[#E08A00]/10";
                                                } else {
                                                    healthColorClass = "text-red-700";
                                                    healthBgClass = "bg-red-50";
                                                }

                                                return (
                                                    <tr
                                                        key={client.id}
                                                        onClick={() => handleViewClient(client.id)}
                                                        className={`transition-colors group cursor-pointer ${selectedClients.includes(client.id) ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : 'hover:bg-[#002D50]/5 bg-white'}`}
                                                    >
                                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-slate-300 text-[#002D50] focus:ring-[#002D50] transition-colors cursor-pointer"
                                                                checked={selectedClients.includes(client.id)}
                                                                onChange={() => handleSelectClient(client.id)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-slate-800">
                                                                    {highlightMatch(client.business_name, debouncedQuery)}
                                                                </span>
                                                                {client.added_by_staff_name && (
                                                                    <span className="text-xs text-slate-500 mt-0.5 inline-flex items-center gap-1">
                                                                        <UserIcon className="w-3 h-3 text-indigo-400" />
                                                                        Added by: <span className="font-medium text-slate-600">{client.added_by_staff_name}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-medium text-slate-500 uppercase">
                                                                {highlightMatch(client.filing_type, debouncedQuery)}
                                                            </span>
                                                        </td>
                                                        {user?.role === 'ca' ? (
                                                            <td className="px-6 py-4">
                                                                {client.assigned_to_name ? (
                                                                    <span className="text-sm font-medium text-slate-700">
                                                                        {highlightMatch(client.assigned_to_name, debouncedQuery)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-sm font-medium text-slate-400 italic">
                                                                        Unassigned
                                                                    </span>
                                                                )}
                                                            </td>
                                                        ) : (
                                                            <td className="px-6 py-4 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-medium text-slate-700">{client.primary_mobile || 'N/A'}</span>
                                                                    {client.whatsapp_mobile && (
                                                                        <a 
                                                                            href={`https://wa.me/${String(client.whatsapp_mobile).replace(/\D/g, '')}`} 
                                                                            target="_blank" 
                                                                            rel="noopener noreferrer" 
                                                                            className="text-green-500 hover:text-green-600 transition-colors bg-green-50 p-1.5 rounded-full hover:bg-green-100" 
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            title="Chat on WhatsApp"
                                                                        >
                                                                            <MessageCircle className="w-4 h-4" />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${healthBgClass} ${healthColorClass}`}>
                                                                {client.compliance_health}%
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); setReviewClientDocs(client); }}
                                                                className="focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-full transition-transform hover:scale-105"
                                                                title={client.pending_count === 0 ? "Completed" : "Review Documents"}
                                                            >
                                                                {client.pending_count === 0 ? (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200 transition-colors border border-green-200 shadow-sm" title="Completed">
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                        Completed
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors border border-orange-200 shadow-sm" title="In-Progress">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                                        {client.pending_count} {client.pending_count === 1 ? 'Document' : 'Documents'}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-sm ${client.overdue_count > 0 ? 'text-red-600 font-bold' : 'text-slate-400 font-semibold'}`}>
                                                                {client.overdue_count}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm text-slate-500">
                                                                {timeAgo(client.last_activity)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleViewClient(client.id);
                                                                    }}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-[#002D50] bg-[#002D50]/5 hover:bg-[#002D50]/10 transition-colors whitespace-nowrap"
                                                                >
                                                                    View <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-16 text-center">
                                                    <EmptyStateCard
                                                        icon={dashboardData.clients.length === 0 ? Users : Search}
                                                        title={dashboardData.clients.length === 0 ? 'No clients yet' : 'No matching clients found'}
                                                        description={dashboardData.clients.length === 0
                                                            ? 'Start by adding your first client to begin tracking compliance across your portfolio.'
                                                            : 'Try adjusting your search or filters to surface the right client record.'}
                                                        helperText={dashboardData.clients.length === 0
                                                            ? 'Once your first client is added, deadlines, documents, and follow-ups become visible in one place.'
                                                            : 'Search by client name, filing type, or assigned teammate to narrow your results.'}
                                                        actionLabel={dashboardData.clients.length === 0 && user?.role === 'ca' ? 'Add Your First Client' : undefined}
                                                        onAction={dashboardData.clients.length === 0 && user?.role === 'ca' ? () => setShowAddModal(true) : undefined}
                                                        animateIcon
                                                    />
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination / Load More */}
                            {visibleCount < sortedAndFilteredClients.length && (
                                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-center mt-auto">
                                    <button
                                        onClick={handleLoadMore}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#002D50]/20 text-[#002D50] font-semibold text-sm hover:bg-[#002D50]/5 hover:border-[#002D50]/30 transition-all shadow-sm"
                                    >
                                        Load More Clients ({sortedAndFilteredClients.length - visibleCount} remaining)
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <CATeamManagement
                        firmClients={dashboardData.clients}
                        caUserId={user?.id}
                        unidentifiedDocs={unidentifiedDocs}
                        refreshDashboard={fetchCADashboard}
                        openInviteSignal={inviteModalSignal}
                        onTeamMemberAdded={handleTeamMemberAdded}
                    />
                )}

            </main>

            {/* Modals */}
            <AddClientModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleClientAdded}
            />
            
            <ReassignClientModal
                isOpen={reassignModal.isOpen}
                onClose={() => setReassignModal({ ...reassignModal, isOpen: false })}
                onSuccess={() => {
                    setReassignModal({ ...reassignModal, isOpen: false });
                    fetchCADashboard();
                }}
                clientId={reassignModal.clientId}
                currentAssignedTo={reassignModal.currentAssignedTo}
                clientName={reassignModal.clientName}
            />

            <CAUnidentifiedModal 
                isOpen={showUnidentifiedModal}
                onClose={() => setShowUnidentifiedModal(false)}
                unidentifiedDocs={unidentifiedDocs}
                clients={dashboardData.clients}
                onAssign={fetchCADashboard}
            />

            <ReviewDocumentsModal 
                client={reviewClientDocs} 
                onClose={() => { setReviewClientDocs(null); fetchCADashboard(); }} 
            />

            <OnboardingSetupModal
                isOpen={showOnboardingModal}
                currentStep={onboardingStep}
                percentComplete={onboardingPercent}
                completedSteps={completedSetupSteps}
                totalSteps={2}
                onInviteTeam={handleOpenInviteTeam}
                onAddClient={handleOpenAddClient}
                onClose={handleDismissOnboarding}
            />
        </div >
    );
};

export default CADashboard;
