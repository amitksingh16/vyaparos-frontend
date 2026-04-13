import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import axios from 'axios';
import Button from '../ui/Button';

const ReassignClientModal = ({ isOpen, onClose, onSuccess, clientId, currentAssignedTo, clientName }) => {
    const [loading, setLoading] = useState(false);
    const [teamLoading, setTeamLoading] = useState(false);
    const [team, setTeam] = useState([]);
    const [error, setError] = useState(null);
    const [assignedTo, setAssignedTo] = useState(currentAssignedTo || '');

    useEffect(() => {
        if (isOpen) {
            setAssignedTo(currentAssignedTo || '');
            const fetchTeam = async () => {
                setTeamLoading(true);
                try {
                    const res = await axios.get('/ca/team');
                    setTeam(res.data);
                } catch (err) {
                    console.error("Failed to fetch team", err);
                } finally {
                    setTeamLoading(false);
                }
            };
            fetchTeam();
        }
    }, [isOpen, currentAssignedTo]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Re-use updateClient endpoint by passing assigned_to
            await axios.put(`/ca/clients/${clientId}`, { assigned_to: assignedTo || null });
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to re-assign client.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-[#0A2C4B]">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                        <UserPlus className="w-5 h-5 text-white/80" />
                        Re-assign Client
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    {error && (
                        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                            <span className="shrink-0 mt-0.5"><X className="w-4 h-4" /></span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form id="reassign-form" onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-sm text-slate-600 mb-4">
                            Select a new team member to manage <strong className="text-slate-800">{clientName}</strong>.
                        </p>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Assign to Team Member
                            </label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                disabled={teamLoading}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#0A2C4B] focus:ring-2 focus:ring-[#0A2C4B]/20 outline-none transition-all appearance-none bg-white cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                            >
                                <option value="">Unassigned (Me)</option>
                                {team.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name} ({member.role === 'ca_staff' ? 'Staff' : 'Article'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="submit" form="reassign-form" disabled={loading} className="min-w-[120px]">
                        {loading ? 'Saving...' : 'Confirm'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ReassignClientModal;
