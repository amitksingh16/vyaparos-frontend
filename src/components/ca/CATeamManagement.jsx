import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Mail, Shield, Plus, X, Trash2, ChevronRight, Check, ClipboardList, FileText, CheckCircle2, AlertTriangle, User as UserIcon, Copy, Send } from 'lucide-react';
import EmptyStateCard from './EmptyStateCard';

const CATeamManagement = ({ firmClients, caUserId, unidentifiedDocs = [], refreshDashboard, openInviteSignal = 0, onTeamMemberAdded }) => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(null); // stores staff member object to remove
    const [showAssignModal, setShowAssignModal] = useState(null); // stores staff member object for assignment
    const [assignSelectedClients, setAssignSelectedClients] = useState([]);

    // Add Staff Form State
    // Add Staff Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState('ca_article');
    const [selectedClients, setSelectedClients] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    // Remove Staff Form State
    const [reassignTo, setReassignTo] = useState(caUserId); // Default to owner

    // Unidentified Tray Modal State
    const [trayModalMember, setTrayModalMember] = useState(null);
    const [assigningDocId, setAssigningDocId] = useState(null);
    const [assignTargetClient, setAssignTargetClient] = useState("");

    const openInviteModal = () => {
        setShowAddModal(true);
        setErrors({});
        setApiError('');
        setName('');
        setEmail('');
        setPhone('');
        setRole('ca_article');
        setSelectedClients([]);
    };

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/ca/team');
            setTeam(res.data);
        } catch (err) {
            console.error("Error fetching team:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    useEffect(() => {
        if (openInviteSignal > 0) {
            openInviteModal();
        }
    }, [openInviteSignal]);

    const handleInvite = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        if (!name.trim()) newErrors.name = true;
        if (!email.trim()) newErrors.email = true;
        if (!phone.trim()) newErrors.phone = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setApiError('');

        try {
            setIsSubmitting(true);
            await axios.post('/ca/team', {
                name,
                email,
                phone,
                role,
                assigned_client_ids: selectedClients,
                origin: window.location.origin
            });
            setShowAddModal(false);
            setName('');
            setEmail('');
            setPhone('');
            setRole('ca_article');
            setSelectedClients([]);
            setErrors({});
            setApiError('');
            fetchTeam();
            if (refreshDashboard) refreshDashboard();
            if (onTeamMemberAdded) onTeamMemberAdded();
        } catch (err) {
            console.error("Failed to invite:", err);
            setApiError(err.response?.data?.message || 'Failed to send invite');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await axios.delete(`/ca/team/${showRemoveModal.id}`, {
                data: { reassign_to: reassignTo }
            });
            setShowRemoveModal(null);
            fetchTeam();
            if (refreshDashboard) refreshDashboard();
        } catch (err) {
            console.error("Failed to remove:", err);
            alert('Failed to remove staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleClientSelection = (clientId) => {
        if (selectedClients.includes(clientId)) {
            setSelectedClients(prev => prev.filter(id => id !== clientId));
        } else {
            setSelectedClients(prev => [...prev, clientId]);
        }
    };

    const handleAssignSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await axios.put(`/ca/team/${showAssignModal.id}/assignments`, {
                assigned_client_ids: assignSelectedClients
            });
            setShowAssignModal(null);
            fetchTeam();
            if (refreshDashboard) refreshDashboard();
        } catch (err) {
            console.error("Failed to update assignments:", err);
            alert('Failed to update client assignments');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleAssignClientSelection = (clientId) => {
        if (assignSelectedClients.includes(clientId)) {
            setAssignSelectedClients(prev => prev.filter(id => id !== clientId));
        } else {
            setAssignSelectedClients(prev => [...prev, clientId]);
        }
    };

    const handleAssignUnidentifiedDoc = async (docId) => {
        if (!assignTargetClient) return;
        try {
            setIsSubmitting(true);
            await axios.put(`/documents/unidentified/${docId}/assign`, {
                business_id: assignTargetClient
            });
            setAssigningDocId(null);
            setAssignTargetClient("");
            
            // If this mapping emptied the staff's tray, close the modal
            const remainingDocs = unidentifiedDocs.filter(d => d.id !== docId && d.receiver_staff_id === trayModalMember?.id);
            if (remainingDocs.length === 0) setTrayModalMember(null);
            
            if (refreshDashboard) refreshDashboard();
        } catch (err) {
            console.error("Error assigning document", err);
            alert("Failed to assign document");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="py-12 flex justify-center text-slate-400">Loading team data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 font-display">Firm Staff & Articles</h2>
                    <p className="text-sm text-slate-500">Manage your team members and assign client portfolios.</p>
                </div>
                <button
                    onClick={openInviteModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0A2C4B]/15 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)]"
                >
                    <Plus className="w-4 h-4" />
                    Invite Member
                </button>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Member</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Clients</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {team.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50">
                                    <EmptyStateCard
                                        icon={Users}
                                        title="Build your team workspace"
                                        description="Invite your first team member so work can be distributed faster across filings, follow-ups, and client communication."
                                        helperText="This helps your firm share workload early instead of bottlenecking everything with the owner."
                                        actionLabel="Invite Your First Team Member"
                                        onAction={openInviteModal}
                                        animateIcon
                                    />
                                </td>
                            </tr>
                        ) : (
                            team.map((member) => {
                                const memberUnidentifiedDocs = unidentifiedDocs.filter(doc => doc.receiver_staff_id === member.id);
                                return (
                                <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-bold text-slate-900">{member.name}</div>
                                                    {memberUnidentifiedDocs.length > 0 && (
                                                        <button 
                                                            onClick={() => setTrayModalMember(member)}
                                                            className="flex items-center gap-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 hover:text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors border border-orange-200 shadow-sm"
                                                            title={`View ${memberUnidentifiedDocs.length} Unidentified Documents`}
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                                                            {memberUnidentifiedDocs.length} Pending
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="text-sm text-slate-600 font-medium flex items-center gap-1 mt-0.5">
                                                    <Mail className="w-3 h-3 text-slate-400" /> {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-slate-700">
                                            <Shield className="w-4 h-4 mr-1.5 text-slate-400" />
                                            {member.role === 'ca_staff' ? 'Senior Staff' : 'Article Assistant'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-700 font-semibold">
                                            {member.phone ? `+91 ${member.phone}` : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                            {member.client_count} Clients
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {member.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                                Invited
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {member.isInvitation ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/invite/${member.token}`;
                                                        navigator.clipboard.writeText(link);
                                                        alert('Invite Link Copied: ' + link);
                                                    }}
                                                    className="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 p-2 rounded-lg transition-colors mr-2 border border-green-100 shadow-sm"
                                                    title="Copy Invite Link"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => alert(`Invitation resent to ${member.email}`)}
                                                    className="text-cyan-600 hover:text-cyan-800 bg-cyan-50 hover:bg-cyan-100 p-2 rounded-lg transition-colors mr-2 border border-cyan-100 shadow-sm"
                                                    title="Resend Invitation"
                                                >
                                                    <Send className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setShowAssignModal(member);
                                                    setAssignSelectedClients(member.assigned_client_ids || []);
                                                }}
                                                className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors mr-2 border border-indigo-100 shadow-sm"
                                                title="Assign Clients"
                                            >
                                                <ClipboardList className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowRemoveModal(member)}
                                            className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors border border-red-100 shadow-sm"
                                            title={member.isInvitation ? "Revoke Invite" : "Remove Member"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-[#0A2C4B] font-display flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#F5A623]" />
                                Invite Team Member
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleInvite} className="p-6" noValidate>
                            {apiError && (
                                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {apiError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                                    <input type="text" value={name} onChange={(e) => { setName(e.target.value); if(errors.name) setErrors({...errors, name: false}); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${errors.name ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]'}`} placeholder="e.g. Rahul Sharma" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors({...errors, email: false}); }} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none ${errors.email ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]'}`} placeholder="e.g. rahul@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number *</label>
                                    <div className="flex">
                                        <span className={`inline-flex items-center px-3 rounded-l-md border border-r-0 bg-slate-50 text-slate-500 sm:text-sm ${errors.phone ? 'border-red-500' : 'border-slate-300'}`}>
                                            🇮🇳 +91
                                        </span>
                                        <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: false}); }} className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-2 outline-none ${errors.phone ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : 'border-slate-300 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B]'}`} placeholder="9876543210" pattern="[0-9]{10}" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A2C4B]/20 focus:border-[#0A2C4B] outline-none bg-white">
                                        <option value="ca_article">Article Assistant</option>
                                        <option value="ca_staff">Senior Staff</option>
                                    </select>
                                    <p className="text-xs text-slate-500 mt-1">Staff will only see clients assigned directly to them.</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Assign Clients right now (Optional)</label>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">{selectedClients.length} Selected</span>
                                </div>
                                <div className="border border-slate-200 rounded-xl overflow-hidden h-48 overflow-y-auto bg-slate-50/50">
                                    {firmClients.length === 0 ? (
                                        <div className="p-4 text-sm text-slate-500 text-center">No clients in your firm yet.</div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {firmClients.map(client => (
                                                <li key={client.id}
                                                    onClick={() => toggleClientSelection(client.id)}
                                                    className="px-4 py-2.5 flex items-center cursor-pointer hover:bg-slate-100 transition-colors"
                                                >
                                                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mr-3 transition-colors ${selectedClients.includes(client.id) ? 'bg-[#002D50] border-[#002D50]' : 'border-slate-300 bg-white'}`}>
                                                        {selectedClients.includes(client.id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{client.business_name}</p>
                                                        <p className="text-xs text-slate-500">{client.filing_type.toUpperCase()}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#002D50] hover:bg-[#0A2C4B] rounded-xl transition-all shadow-sm flex items-center gap-2">
                                    {isSubmitting ? 'Sending Invite...' : 'Send Invitation link'}
                                    {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Remove Staff Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
                            <h3 className="text-lg font-bold text-red-800 font-display flex items-center gap-2">
                                <Trash2 className="w-5 h-5 text-red-600" />
                                Remove Team Member
                            </h3>
                            <button onClick={() => setShowRemoveModal(null)} className="text-red-400 hover:text-red-600 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRemove} className="p-6">
                            {showRemoveModal.isInvitation ? (
                                <p className="text-slate-600 text-sm mb-4">
                                    You are about to revoke the pending invitation for <strong className="text-slate-800">{showRemoveModal.email}</strong>.
                                    The link will become invalid.
                                </p>
                            ) : (
                                <>
                                    <p className="text-slate-600 text-sm mb-4">
                                        You are about to remove <strong className="text-slate-800">{showRemoveModal.name}</strong> from your firm.
                                        They currently have <strong className="text-red-600">{showRemoveModal.client_count}</strong> clients assigned to them.
                                    </p>
        
                                    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Re-assign their clients to:</label>
                                        <select
                                            value={reassignTo}
                                            onChange={(e) => setReassignTo(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium text-slate-800"
                                        >
                                            <option value={caUserId}>Myself (Firm Owner)</option>
                                            {team.filter(m => !m.isInvitation && m.id !== showRemoveModal.id).map(member => (
                                                <option key={member.id} value={member.id}>{member.name} ({member.role === 'ca_staff' ? 'Staff' : 'Article'})</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500 mt-2">This ensures no client compliance tracking falls through the cracks.</p>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowRemoveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm">
                                    {isSubmitting ? (showRemoveModal.isInvitation ? 'Revoking...' : 'Removing...') : (showRemoveModal.isInvitation ? 'Confirm Revoke' : 'Confirm Removal')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Clients Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-indigo-50/50">
                            <h3 className="text-lg font-bold text-indigo-900 font-display flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-indigo-600" />
                                Assign Clients to {showAssignModal.name}
                            </h3>
                            <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAssignSubmit} className="p-6">
                            <p className="text-sm text-slate-600 mb-4">
                                Select the clients you want to assign to this staff member.
                            </p>

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-slate-700">Client Portfolio</label>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-medium">{assignSelectedClients.length} Assigned</span>
                                </div>
                                <div className="border border-slate-200 rounded-xl overflow-hidden h-64 overflow-y-auto bg-slate-50/50">
                                    {firmClients.length === 0 ? (
                                        <div className="p-4 text-sm text-slate-500 text-center">No clients in your firm yet.</div>
                                    ) : (
                                        <ul className="divide-y divide-slate-100">
                                            {firmClients.map(client => (
                                                <li key={client.id}
                                                    onClick={() => toggleAssignClientSelection(client.id)}
                                                    className={`px-4 py-3 flex items-center cursor-pointer hover:bg-indigo-50/30 transition-colors ${assignSelectedClients.includes(client.id) ? 'bg-indigo-50/50' : 'bg-white'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mr-3 transition-colors ${assignSelectedClients.includes(client.id) ? 'bg-[#002D50] border-[#002D50]' : 'border-slate-300 bg-white'}`}>
                                                        {assignSelectedClients.includes(client.id) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">{client.business_name}</p>
                                                        <p className="text-xs text-slate-500">{client.filing_type.toUpperCase()}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-[#0A2C4B] hover:bg-[#002D50] rounded-xl transition-all shadow-sm">
                                    {isSubmitting ? 'Saving...' : 'Save Assignments'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Unidentified Tray Modal */}
            {trayModalMember && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-orange-200 flex justify-between items-center bg-orange-50 sticky top-0 z-10">
                            <h3 className="text-lg font-bold text-orange-900 font-display flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                                Unidentified Tray: {trayModalMember.name}
                            </h3>
                            <button onClick={() => setTrayModalMember(null)} className="text-orange-500 hover:text-orange-700 p-1 rounded-full hover:bg-orange-200 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 bg-slate-50">
                            <p className="text-sm text-slate-600 font-medium">
                                These documents were received via WhatsApp on {trayModalMember.name}'s assigned link but the sender's number isn't mapped to any client.
                            </p>
                            
                            {unidentifiedDocs.filter(doc => doc.receiver_staff_id === trayModalMember.id).map(doc => (
                                <div key={doc.id} className="bg-white rounded-xl p-4 border border-orange-100 flex flex-col shadow-sm transition-all hover:shadow-md">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate" title={doc.name}>{doc.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500 font-medium w-full">
                                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md border border-orange-100">
                                                        <UserIcon className="w-3 h-3" /> From: {doc.sender_mobile}
                                                    </span>
                                                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                                                    <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                        Staff Link: {trayModalMember.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <a 
                                                href={doc.file_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors border border-indigo-200 shadow-sm"
                                            >
                                                <FileText className="w-4 h-4" /> View
                                            </a>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="text-sm font-semibold text-slate-700 w-full sm:w-36 flex-shrink-0">Override & Assign:</div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <select 
                                                value={assigningDocId === doc.id ? assignTargetClient : ""}
                                                onChange={(e) => {
                                                    setAssigningDocId(doc.id);
                                                    setAssignTargetClient(e.target.value);
                                                }}
                                                className="flex-1 text-sm border-2 border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 font-medium text-slate-700 max-w-sm"
                                            >
                                                <option value="">Select Target Client...</option>
                                                {firmClients.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.business_name} {c.filing_type ? `(${c.filing_type.toUpperCase()})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <button 
                                                onClick={() => handleAssignUnidentifiedDoc(doc.id)}
                                                disabled={isSubmitting || assigningDocId !== doc.id || !assignTargetClient}
                                                className="inline-flex items-center gap-1.5 bg-[#0A2C4B] hover:bg-[#002D50] disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex-shrink-0"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Save
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CATeamManagement;
