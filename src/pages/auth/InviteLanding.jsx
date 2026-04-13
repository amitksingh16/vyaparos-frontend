import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, Loader2, User as UserIcon, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const InviteLanding = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const [inviteData, setInviteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await axios.get(`/invitations/${token}`);
                setInviteData(res.data);
                // Pre-fill name from email prefix if we want, or leave blank
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired invitation link.');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchInvite();
        } else {
            setError('No invitation token provided.');
            setLoading(false);
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!name.trim()) {
            return setError('Full name is required');
        }
        if (password.length < 6) {
            return setError('Password must be at least 6 characters long');
        }
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            setIsSubmitting(true);
            const res = await axios.post(`/invitations/${token}/accept`, { name, password });

            // Set the token globally
            localStorage.setItem('token', res.data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

            // Force full reload or navigate to ensure auth context picks it up correctly
            window.location.href = '/ca/dashboard';

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete setup');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
                <Loader2 className="w-8 h-8 text-[#002D50] animate-spin" />
                <p className="mt-4 text-slate-500 font-medium text-sm">Validating invitation...</p>
            </div>
        );
    }

    if (error && !inviteData) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200 text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 font-display mb-2">Link Expired or Invalid</h2>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="inline-flex justify-center w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#002D50] hover:bg-[#0A2C4B] transition-colors"
                        >
                            Return Home
                        </button>
                        <p className="mt-4 text-sm text-slate-500">Please contact your CA firm administrator for a new invitation link.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Shield className="w-12 h-12 text-[#002D50]" />
                </div>
                <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-900 font-display">
                    Join {inviteData.firm_name}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 font-medium">
                    You've been invited as a {inviteData.role === 'ca_staff' ? 'Senior Staff' : 'Article Assistant'}.
                    <br />Complete your profile to access your dashboard.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-slate-200">
                    {error && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Invitation Details</p>
                            <p className="text-sm font-bold text-slate-800">{inviteData.email}</p>
                            <p className="text-sm text-slate-600">{inviteData.phone}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Full Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10 block w-full border border-slate-300 rounded-lg py-2.5 outline-none focus:ring-2 focus:ring-[#002D50]/20 focus:border-[#002D50] transition-colors"
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Set Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 block w-full border border-slate-300 rounded-lg py-2.5 outline-none focus:ring-2 focus:ring-[#002D50]/20 focus:border-[#002D50] transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 block w-full border border-slate-300 rounded-lg py-2.5 outline-none focus:ring-2 focus:ring-[#002D50]/20 focus:border-[#002D50] transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#002D50] hover:bg-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2C4B] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Joining Team...
                                </>
                            ) : (
                                'Accept Invitation'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteLanding;
