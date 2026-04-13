import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import { Shield, Bell, User as UserIcon, CheckCircle2, AlertCircle, AlertTriangle, Clock, FileText, Upload, Bot, Activity, Zap, History, ArrowLeft, Info, MessageSquare, Mail, Phone, MessageCircle } from 'lucide-react';

import Button from '../components/ui/Button';
import DocumentVault from '../components/documents/DocumentVault';
import { NotificationDropdown, ProfileDropdown } from '../components/ui/HeaderDropdowns';

// Utility to convert timestamp to relative generic time like '2 hours ago'
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

const Dashboard = () => {
    const { user } = useAuth();
    const { id: urlBusinessId } = useParams(); // For CA viewing a client
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [clientName, setClientName] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientMobile, setClientMobile] = useState("");
    const [clientWhatsapp, setClientWhatsapp] = useState("");
    const [allTasks, setAllTasks] = useState([]);
    const [rawActivities, setRawActivities] = useState([]);
    const [whatsappAlerts, setWhatsappAlerts] = useState(true);
    const [emailDigest, setEmailDigest] = useState(true);
    const [currentBizId, setCurrentBizId] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [clientHealthScore, setClientHealthScore] = useState(100);

    const userName = user?.name?.split(' ')[0] || "User";

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                let primaryBusinessId = urlBusinessId;

                // If not viewing a specific client, fetch user's businesses
                if (!primaryBusinessId) {
                    const bizRes = await axios.get('/businesses');
                    const businesses = bizRes.data;
                    if (businesses.length > 0) {
                        primaryBusinessId = businesses[0].id;
                        setCurrentBizId(businesses[0].id);
                        setClientName(businesses[0].business_name);
                        setClientEmail(businesses[0].email || "");
                        setClientMobile(businesses[0].primary_mobile || "");
                        setClientWhatsapp(businesses[0].whatsapp_mobile || businesses[0].primary_mobile || "");
                        setWhatsappAlerts(businesses[0].whatsapp_alerts ?? true);
                        setEmailDigest(businesses[0].email_digest ?? true);
                    }
                } else {
                    // Fetch specific business details for CA
                    // For a robust system, we would have a specific endpoint. 
                    // Assuming /businesses/:id or similar, or just relying on existing endpoints.
                    // If we just need name, we could fetch it or pass it. 
                    // Let's use a try block, if it fails, fallback.
                    try {
                        let bizRes;
                        setCurrentBizId(primaryBusinessId); // Set immediately so Vault can at least try loading Docs
                        if (['ca', 'ca_staff', 'ca_article'].includes(user?.role)) {
                            bizRes = await axios.get(`/ca/clients/${primaryBusinessId}`);
                        } else {
                            bizRes = await axios.get(`/businesses/${primaryBusinessId}`);
                        }
                        setClientName(bizRes.data.business_name);
                        setClientEmail(bizRes.data.email || "");
                        setClientMobile(bizRes.data.primary_mobile || "");
                        setClientWhatsapp(bizRes.data.whatsapp_mobile || bizRes.data.primary_mobile || "");
                        setWhatsappAlerts(bizRes.data.whatsapp_alerts ?? true);
                        setEmailDigest(bizRes.data.email_digest ?? true);
                    } catch (error) {
                        console.error("Error fetching specific business details:", error);
                        setClientName("Client");
                    }
                }

                if (primaryBusinessId) {

                    // 2. Fetch compliance calendar for this business
                    const compRes = await axios.get(`/compliance/calendar?business_id=${primaryBusinessId}`);
                    const allItems = compRes.data;
                    setAllTasks(allItems);

                    // 2.5 Fetch documents for health score
                    const docsRes = await axios.get(`/documents/${primaryBusinessId}`);
                    const docs = docsRes.data || [];

                    const now = new Date();
                    const currentMonthStr = now.toISOString().slice(0, 7);
                    
                    let bankCount = 0;
                    let salesCount = 0;
                    let purchaseCount = 0;

                    docs.forEach(doc => {
                        if (doc.month === currentMonthStr) {
                            if (doc.category === 'Bank Statements') bankCount++;
                            if (doc.category === 'GST Sales') salesCount++;
                            if (doc.category === 'GST Purchase') purchaseCount++;
                        }
                    });

                    let categoriesPresent = 0;
                    if (bankCount > 0) categoriesPresent++;
                    if (salesCount > 0) categoriesPresent++;
                    if (purchaseCount > 0) categoriesPresent++;

                    // Override the local compliance calculation with the new logic
                    const newHealthScore = Math.round((categoriesPresent / 3) * 100);
                    setClientHealthScore(newHealthScore);

                    // 3. Process items: filter upcoming, calculate days left, sort
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const processedTasks = allItems
                        .filter(item => item.status === 'upcoming' || item.status === 'pending' || item.status === 'filed' || item.status === 'overdue')
                        .map(item => {
                            const dueDate = new Date(item.due_date);
                            const timeDiff = dueDate.getTime() - today.getTime();
                            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

                            let uiStatus;
                            if (item.status === 'filed') uiStatus = 'filed';
                            else if (item.status === 'overdue') uiStatus = 'overdue';
                            else uiStatus = daysLeft <= 7 ? 'warning' : 'info';

                            return {
                                id: item.id,
                                title: item.compliance_type ? item.compliance_type.toUpperCase() : 'UNKNOWN',
                                dueIn: daysLeft,
                                dueDate: dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                                status: uiStatus,
                                originalStatus: item.status
                            };
                        })
                        .filter(item => item.status === 'overdue' || item.dueIn >= 0 || item.originalStatus === 'filed') // overdue, future/today, or filed items
                        .sort((a, b) => {
                            // 1. Overdue always at the top
                            if (a.originalStatus === 'overdue' && b.originalStatus !== 'overdue') return -1;
                            if (b.originalStatus === 'overdue' && a.originalStatus !== 'overdue') return 1;

                            // 2. Put filed items at the end
                            if (a.originalStatus === 'filed' && b.originalStatus !== 'filed') return 1;
                            if (b.originalStatus === 'filed' && a.originalStatus !== 'filed') return -1;

                            // 3. Otherwise sort by closest due date
                            return a.dueIn - b.dueIn;
                        })
                        .slice(0, 4); // Show top 4

                    setUpcomingTasks(processedTasks);

                    // 4. Fetch recent activities
                    const actRes = await axios.get(`/businesses/${primaryBusinessId}/activities`);
                    setRawActivities(actRes.data);
                    setRecentActivity(actRes.data.map(act => {
                        let type = 'info';
                        let text = act.description || act.action_type || '';

                        const performedByName = act.user ? act.user.name : (act.performed_by ? 'Team Member' : 'System');

                        if (performedByName && performedByName !== 'System') {
                            if (!text.includes(' by ')) {
                                text = `${text} by ${performedByName}`;
                            }
                        }

                        if (act.event_type === 'COMPLIANCE_MARKED_FILED' || act.action_type === 'filed') {
                            type = 'success';
                        } else if (act.event_type === 'COMPLIANCE_MARKED_PENDING') {
                            type = 'warning';
                        } else if (act.event_type === 'OVERDUE' || act.action_type === 'overdue') {
                            type = 'error';
                        }

                        return {
                            id: act.id,
                            action: text || 'Action performed',
                            type: type,
                            time: timeAgo(act.createdAt)
                        };
                    }));
                }
            } catch (err) {
                console.error("Error fetching dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [urlBusinessId, user?.role]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const toggleSetting = async (setting) => {
        if (!currentBizId) return;
        const isWhatsapp = setting === 'whatsapp_alerts';
        const newValue = isWhatsapp ? !whatsappAlerts : !emailDigest;

        // Optimistic UI
        if (isWhatsapp) setWhatsappAlerts(newValue);
        else setEmailDigest(newValue);

        try {
            await axios.put(`/businesses/${currentBizId}/settings`, { [setting]: newValue });
        } catch (error) {
            console.error("Failed to update setting", error);
            // Revert
            if (isWhatsapp) setWhatsappAlerts(!newValue);
            else setEmailDigest(!newValue);
        }
    };

    const getDaysDifference = (pastDate, futureDate) => {
        return Math.floor((futureDate - pastDate) / (1000 * 3600 * 24));
    };

    let aiOverdueCount = 0;
    let pendingTotalCount = 0;
    // mostOverdue logic removed since it was unused
    let dueWithin3DaysCount = 0;

    allTasks.forEach(task => {
        if (task.status === 'filed') return;

        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        const isOverdue = dueDate < today || task.status === 'overdue';

        if (isOverdue) {
            aiOverdueCount++;
        } else {
            const daysUntilDue = getDaysDifference(today, dueDate);
            if (daysUntilDue >= 0 && daysUntilDue <= 3) {
                dueWithin3DaysCount++;
            }
            if (task.status === 'pending' || task.status === 'upcoming') {
                pendingTotalCount++;
            }
        }
    });

    // Compliance score is now calculated in fetchData and set to state, OR we assume we can set it to a ref / state.
    // Wait, let's create a state for it at the top of the component!
    // Since I'm doing a multi-replace, I'll just rely on the existing state or add a new state `clientHealthScore`.
    const complianceScore = clientHealthScore;

    const aiSuggestions = [];

    // Rule 1: Overdue Logic
    if (aiOverdueCount > 5) {
        aiSuggestions.push({
            id: 'high-overdue',
            severity: 'HIGH',
            headline: `${aiOverdueCount} filing${aiOverdueCount !== 1 ? 's' : ''} currently overdue.`,
            subtext: "Immediate action required to prevent further penalties."
        });
    } else if (aiOverdueCount >= 1 && aiOverdueCount <= 5) {
        aiSuggestions.push({
            id: 'medium-overdue',
            severity: 'MEDIUM',
            headline: `${aiOverdueCount} filing${aiOverdueCount !== 1 ? 's' : ''} currently overdue.`,
            subtext: "Please prioritize filing these immediately."
        });
    }

    // Rule 2 & 4: Health Alert (incorporating pending count explanation to avoid duplicates)
    // 0-49% -> HIGH (Critical), 50-79% -> MEDIUM (Attention), 80-100% -> Healthy
    const healthSeverity = complianceScore < 50 ? 'HIGH' : complianceScore <= 79 ? 'MEDIUM' : 'HEALTHY';
    let healthAlertGenerated = false;

    if (healthSeverity !== 'HEALTHY') {
        const issues = [];
        if (aiOverdueCount > 0) issues.push(`${aiOverdueCount} overdue`);
        if (pendingTotalCount > 0) issues.push(`${pendingTotalCount} open`);
        const issuesText = issues.join(' and ');

        aiSuggestions.push({
            id: 'health-alert',
            severity: healthSeverity,
            headline: `${healthSeverity === 'HIGH' ? 'Critical' : 'Moderate'} Health Score (${complianceScore}%)`,
            subtext: `Health score at ${complianceScore}% due to ${issuesText} compliance${(aiOverdueCount + pendingTotalCount) > 1 ? 's' : ''}.`
        });
        healthAlertGenerated = true; // Prevents separate pending card
    }

    // Rule 3: MEDIUM - Due within 3 days
    if (dueWithin3DaysCount > 0) {
        aiSuggestions.push({
            id: 'medium-due',
            severity: 'MEDIUM',
            headline: `${dueWithin3DaysCount} filing${dueWithin3DaysCount > 1 ? 's' : ''} due within 3 days.`,
            subtext: "Prepare documentation to avoid last-minute rush."
        });
    }

    // Rule 5: REVIEW - No activity in last 15 days
    let daysSinceLastActivity = 15; // default
    if (rawActivities.length > 0) {
        const latestActivityDate = new Date(Math.max(...rawActivities.map(a => new Date(a.createdAt))));
        latestActivityDate.setHours(0, 0, 0, 0);
        daysSinceLastActivity = getDaysDifference(latestActivityDate, today);
    }

    if (daysSinceLastActivity >= 15) {
        aiSuggestions.push({
            id: 'review-activity',
            severity: 'REVIEW',
            headline: rawActivities.length === 0 ? `No activity recorded in 15+ days.` : `No activity recorded in ${daysSinceLastActivity} days.`,
            subtext: "Review client status to ensure compliance progress."
        });
    }

    // Rule 6: REVIEW - > 5 filings pending
    if (aiOverdueCount === 0 && pendingTotalCount > 5 && !healthAlertGenerated) {
        aiSuggestions.push({
            id: 'review-pending',
            severity: 'REVIEW',
            headline: `${pendingTotalCount} filings are currently pending.`,
            subtext: "High volume of open items. Plan scheduling."
        });
    }

    // Sort suggestions
    const severityOrder = { 'HIGH': 1, 'MEDIUM': 2, 'REVIEW': 3 };
    aiSuggestions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    const markAsFiled = async (complianceId) => {
        try {
            setActionLoading(true);
            await axios.put(`/compliance/${complianceId}/file`);

            // Re-fetch data after successful update
            // We can just trigger the useEffect again by modifying a state variable if we wanted, 
            // but for simplicity we'll just update the local state manually or re-run the fetch block.
            // A quick re-render of local state is faster:

            // Mark task as filed locally
            setUpcomingTasks(prevTasks => prevTasks.map(t =>
                t.id === complianceId ? { ...t, status: 'filed', originalStatus: 'filed' } : t
            ));

            setAllTasks(prevTasks => prevTasks.map(t =>
                t.id === complianceId ? { ...t, status: 'filed' } : t
            ));

            // Refresh activity logs by calling the fetch API again for just activities
            // We need primaryBusinessId. We can get it from the user context but let's grab it via a quick fetch
            let businessIdToFetch = urlBusinessId;
            if (!businessIdToFetch) {
                const bizRes = await axios.get('/businesses');
                if (bizRes.data.length > 0) {
                    businessIdToFetch = bizRes.data[0].id;
                }
            }

            if (businessIdToFetch) {
                const actRes = await axios.get(`/businesses/${businessIdToFetch}/activities`);
                setRawActivities(actRes.data);
                setRecentActivity(actRes.data.map(act => {
                    let text = '';
                    let type = 'info';

                    if (act.action_type === 'filed') {
                        text = `${act.compliance_type} marked as filed`;
                        type = 'success';
                    } else if (act.action_type === 'overdue') {
                        text = `${act.compliance_type} marked as overdue`;
                        type = 'error';
                    } else if (act.action_type === 'created') {
                        text = `${act.compliance_type} schedules created`;
                        type = 'info';
                    }

                    return {
                        id: act.id,
                        action: text,
                        type: type,
                        time: timeAgo(act.createdAt)
                    };
                }));
            }

        } catch (error) {
            console.error('Error marking as filed:', error);
            // Optionally show error toast to user here
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-[#F5A623]" />
                            <span className="text-xl font-bold text-[#0A2C4B] font-display">VyaparOS</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* 1. Welcome Section */}
                <div className="mb-8">
                    {urlBusinessId ? (
                        <>
                            <Link
                                to="/ca/dashboard"
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#0A2C4B] transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold font-display text-slate-900 leading-tight flex items-center gap-3">
                                <span className="truncate max-w-[200px] sm:max-w-md">{clientName || "Loading Client..."}</span>
                                {user?.role === 'ca' && <span className="text-[10px] text-[#F5A623] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">CA View</span>}
                                {user?.role === 'ca_staff' && <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">Staff View</span>}
                                {user?.role === 'ca_article' && <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Article View</span>}
                            </h1>
                            {(clientMobile || clientEmail || clientWhatsapp) && (
                                <div className="mt-3 mb-1 flex flex-wrap gap-2.5">
                                    {clientMobile && (
                                        <a href={`tel:${clientMobile}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0A2C4B] hover:bg-slate-50 hover:border-[#0A2C4B]/30 transition-all shadow-sm">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            {clientMobile}
                                        </a>
                                    )}
                                    {clientWhatsapp && (
                                        <a href={`https://wa.me/${String(clientWhatsapp).replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-100 hover:border-green-300 transition-all shadow-sm">
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            WhatsApp
                                        </a>
                                    )}
                                    {clientEmail && (
                                        <a href={`mailto:${clientEmail}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            Email
                                        </a>
                                    )}
                                </div>
                            )}
                            <p className="text-slate-500 mt-1">
                                Client compliance overview
                            </p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold font-display text-slate-900 leading-tight">
                                Good Evening, {userName}
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Here's your compliance overview
                            </p>
                        </>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex space-x-6 mb-6 border-b border-slate-200">
                    <button 
                        onClick={() => setActiveTab('overview')} 
                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[#0A2C4B] text-[#0A2C4B]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Compliance Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('documents')} 
                        className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${activeTab === 'documents' ? 'border-[#0A2C4B] text-[#0A2C4B]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        Document Vault
                    </button>
                </div>

                {activeTab === 'overview' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Metrics) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* AI Client Guidance Section */}
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                                <Bot className="w-5 h-5 text-purple-600" />
                                AI Client Guidance
                            </h2>
                            <div className="space-y-3">
                                {aiSuggestions.length > 0 ? (
                                    aiSuggestions.map(sugg => {
                                        const hasHighSeverity = aiSuggestions.some(a => a.severity === 'HIGH');
                                        const isDeemphasized = hasHighSeverity && sugg.severity === 'REVIEW';

                                        const severityClass = sugg.severity === 'HIGH' ? 'severity-high'
                                            : sugg.severity === 'MEDIUM' ? 'severity-medium' : 'severity-review';

                                        const bgColor = isDeemphasized ? 'bg-slate-50 opacity-80' : 'bg-white';

                                        return (
                                            <div key={sugg.id} className={`${bgColor} rounded-[12px] p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${severityClass}`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-1 severity-icon-text">
                                                        {sugg.severity === 'HIGH' && <AlertTriangle className="w-5 h-5" />}
                                                        {sugg.severity === 'MEDIUM' && <AlertCircle className="w-5 h-5" />}
                                                        {sugg.severity === 'REVIEW' && <Info className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide severity-badge`}>
                                                                {sugg.severity}
                                                            </span>
                                                            <h3 className={`font-semibold text-sm ${isDeemphasized ? 'text-slate-600' : 'text-slate-800'}`}>{sugg.headline}</h3>
                                                        </div>
                                                        <p className={`text-sm ${isDeemphasized ? 'text-slate-400' : 'text-slate-500'}`}>{sugg.subtext}</p>
                                                    </div>
                                                </div>
                                                <Link to="#" className="flex-shrink-0">
                                                    <Button variant="outline" size="sm" className={`w-full sm:w-auto text-xs whitespace-nowrap ${isDeemphasized ? 'opacity-80 hover:opacity-100' : ''}`}>
                                                        Review Compliance &rarr;
                                                    </Button>
                                                </Link>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-white rounded-[12px] p-5 shadow-sm border border-slate-200 border-l-4 border-l-green-500 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">No active risks detected. Client is stable.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Compliance Health Card */}
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* Decorative background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

                            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-600" />
                                Compliance Health
                            </h2>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-end gap-3 mb-2">
                                        <span className="text-5xl font-bold font-display text-slate-900">{complianceScore}%</span>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold mb-1 ${complianceScore >= 90 ? 'bg-green-100 text-green-700' :
                                            complianceScore >= 70 ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {complianceScore >= 90 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                                            {complianceScore >= 90 ? 'Good' : complianceScore >= 70 ? 'Average' : 'Critical'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {complianceScore >= 90 ? 'Your business is highly compliant. Keep it up!' :
                                            'Some compliances need your immediate attention.'}
                                    </p>
                                </div>

                                <div className="w-full sm:w-1/2">
                                    <div className="flex justify-between text-xs font-medium text-slate-500 mb-2">
                                        <span>Risk Level</span>
                                        <span className={complianceScore >= 90 ? 'text-green-600' : complianceScore >= 70 ? 'text-orange-600' : 'text-red-600'}>
                                            {complianceScore >= 90 ? 'Low Risk' : complianceScore >= 70 ? 'Moderate Risk' : 'High Risk'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                                        <div className={`h-2.5 rounded-full ${complianceScore >= 90 ? 'bg-green-500' :
                                            complianceScore >= 70 ? 'bg-orange-500' : 'bg-red-500'
                                            }`} style={{ width: `${complianceScore}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Upcoming Compliance Section */}
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-500" />
                                    Upcoming Deadlines
                                </h2>
                                <Link to="#" className="text-sm font-medium text-[#0A2C4B] hover:underline">View All</Link>
                            </div>

                            <div className="space-y-3">
                                {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
                                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.status === 'overdue' ? 'bg-[#FFF7ED] text-[#F97316]' :
                                                task.status === 'warning' ? 'bg-orange-50 text-orange-600' :
                                                    task.status === 'filed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0A2C4B]">{task.title}</p>
                                                <p className="text-xs text-slate-500 font-medium">
                                                    {task.originalStatus === 'filed' ? `Filed on ${task.dueDate}` :
                                                        task.originalStatus === 'overdue' ? `Was due on ${task.dueDate}` :
                                                            `Due in ${task.dueIn} days (${task.dueDate})`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {task.originalStatus === 'filed' ? (
                                                <>
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Filed
                                                    </span>
                                                    <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                                                        Mark as Filed
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${task.originalStatus === 'overdue' ? 'bg-[#FFF7ED] text-[#F97316] border-[#FDBA74]' :
                                                        task.dueIn <= 7 ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                        {task.originalStatus === 'overdue' ? 'Overdue' : task.dueIn <= 7 ? 'Urgent' : 'Pending'}
                                                    </span>
                                                    <Button
                                                        onClick={() => markAsFiled(task.id)}
                                                        disabled={actionLoading}
                                                        size="sm"
                                                        variant="outline"
                                                        className="hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                                                    >
                                                        Mark as Filed
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-slate-500 text-sm">
                                        {loading ? "Loading deadlines..." : "No upcoming deadlines found."}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Actions & Activity) */}
                    <div className="space-y-6">

                        {/* 4. Quick Actions Section */}
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-500" />
                                Quick Actions
                            </h2>
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={async () => {
                                        if(!currentBizId) return;
                                        try {
                                            const response = await axios.get(`/actions/${currentBizId}/filing-report`, {
                                                responseType: 'blob', // Important for PDF
                                            });
                                            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                            const link = document.createElement('a');
                                            link.href = url;
                                            link.setAttribute('download', `${clientName.replace(/\s+/g, '_')}_Filing_Report.pdf`);
                                            document.body.appendChild(link);
                                            link.click();
                                            link.parentNode.removeChild(link);
                                        } catch {
                                            alert('Error downloading report.');
                                        }
                                    }}
                                    className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-slate-200 hover:border-[#0A2C4B] hover:bg-[#0A2C4B]/5 text-left transition-colors group"
                                >
                                    <div className="text-slate-500 group-hover:text-[#0A2C4B] transition-colors">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-[#0A2C4B] transition-colors">Filing Report</span>
                                </button>

                                <button 
                                    onClick={async () => {
                                        if(!currentBizId) return;
                                        try {
                                            const { data } = await axios.post(`/actions/${currentBizId}/whatsapp-reminder`);
                                            if(data.url) window.open(data.url, '_blank');
                                        } catch(e) {
                                            alert(e.response?.data?.message || 'Error triggering WhatsApp reminder');
                                        }
                                    }}
                                    className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-slate-200 hover:border-green-600 hover:bg-green-50 text-left transition-colors group"
                                >
                                    <div className="text-green-500 group-hover:text-green-600 transition-colors">
                                        <MessageCircle className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium text-slate-700 group-hover:text-green-700 transition-colors">Send WhatsApp Reminder</span>
                                </button>
                            </div>
                        </div>

                        {/* 5. Recent Activity */}
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <History className="w-5 h-5 text-slate-500" />
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                    <div key={activity.id} className="flex gap-4 relative">
                                        {/* Timeline connector line */}
                                        {index !== recentActivity.length - 1 && (
                                            <div className="absolute left-2.5 top-7 bottom-[-16px] w-[2px] bg-slate-100"></div>
                                        )}

                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${activity.type === 'success' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'error' ? 'bg-red-100 text-red-600' :
                                                'bg-indigo-50 text-indigo-600'
                                            }`}>
                                            {activity.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                                                activity.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                                                    <History className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-700">{activity.action}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-4 text-slate-500 text-sm">
                                        No recent activity found.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 6. Communication Settings */}
                        <div className="bg-white rounded-[16px] p-5 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-indigo-500" />
                                Communication Settings
                            </h2>
                            <div className="space-y-4">

                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">WhatsApp Alerts</p>
                                            <p className="text-xs text-slate-500">Receive urgent T-minus reminders on WhatsApp</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={whatsappAlerts}
                                            onChange={() => toggleSetting('whatsapp_alerts')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#F97316]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#F97316]"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">Email Digest</p>
                                            <p className="text-xs text-slate-500">Get a weekly summary of upcoming tasks</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={emailDigest}
                                            onChange={() => toggleSetting('email_digest')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0A2C4B]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A2C4B]"></div>
                                    </label>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
                ) : (
                    <DocumentVault businessId={currentBizId} user={user} clientName={clientName} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
