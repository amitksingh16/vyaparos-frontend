import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const SetupPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [status, setStatus] = useState('loading'); // loading, active, invalid, expired, success
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Verify token on load
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('invalid');
                return;
            }
            try {
                // Determine whether it's GET or POST based on standard conventions
                // But generally POST is used if we are "verifying", or GET if fetching state. Will use POST.
                await axios.post('/verify-invite', { token });
                setStatus('active');
            } catch (error) {
                const errMsg = error.response?.data?.message?.toLowerCase() || '';
                if (errMsg.includes('expired')) {
                    setStatus('expired');
                } else {
                    setStatus('invalid');
                }
            }
        };
        verifyToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            return setToast({ message: 'Password must be at least 6 characters', type: 'error' });
        }
        if (password !== confirmPassword) {
            return setToast({ message: 'Passwords do not match', type: 'error' });
        }

        setLoading(true);
        try {
            await axios.post('/set-password', { token, password });
            
            setStatus('success');
            setToast({ message: 'Password set successfully! Redirecting to login...', type: 'success' });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error(error);
            const errorMsg = error.response?.data?.message || 'Failed to set password. Please try again.';
            setToast({ message: errorMsg, type: 'error' });
            setLoading(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mb-4"></div>
                <p className="text-slate-600 font-medium">Verifying invitation...</p>
            </div>
        );
    }

    if (status === 'invalid' || status === 'expired') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[16px] shadow-xl text-center border border-slate-100">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                        {status === 'expired' ? (
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        ) : (
                            <Shield className="w-8 h-8 text-red-600" />
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">
                        {status === 'expired' ? 'Invitation Expired' : 'Invalid Invitation'}
                    </h1>
                    <p className="text-slate-500 mb-8">
                        {status === 'expired' 
                            ? 'This invitation link has expired. Please request a new invite from your administrator.'
                            : 'This invitation link is invalid or has already been used.'}
                    </p>
                    <Button 
                        onClick={() => navigate('/login')} 
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white rounded-xl py-3"
                    >
                        Back to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
                <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-[16px] shadow-xl text-center border border-slate-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Password Set Successfully!</h1>
                    <p className="text-slate-500 mb-8">You can now use your password to log in to your account.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            <div className="max-w-md w-full">
                <div className="bg-white p-8 sm:p-10 rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="text-center mb-8">
                        <div className="mx-auto w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 font-display">
                            Setup Password
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Create a secure password to access your account
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <Input
                            label="Set Password"
                            type="password"
                            icon={<Lock className="w-5 h-5 text-slate-400" />}
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoFocus
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            icon={<Lock className="w-5 h-5 text-slate-400" />}
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        <Button 
                            type="submit" 
                            isLoading={loading} 
                            className="w-full bg-[#0F5C4A] hover:bg-[#0A4134] text-white py-3 mt-4 rounded-xl transition-all" 
                            fullWidth
                        >
                            Set Password & Continue
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SetupPassword;
