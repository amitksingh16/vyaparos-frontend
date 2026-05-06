import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom'; // useParams ki jagah useSearchParams
import axios from 'axios';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

import { Shield, Mail, Lock, User } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const InviteAccept = () => {
    const [searchParams] = useSearchParams(); // Naya logic
    const token = searchParams.get('token');  // URL se "?token=..." nikalega
    const navigate = useNavigate();

    const [inviteData, setInviteData] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, active, expired, not_found

    // Auth State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const res = await axios.get(`/invitations/${token}`);
                setInviteData(res.data);
                setEmail(res.data.email || ''); // Pre-fill their assigned email
                setStatus('active');
            } catch (error) {
                setStatus(error.response?.status === 404 ? 'not_found' : 'expired');
            }
        };
        fetchInvite();
    }, [token]);


    const handleVerifyAndAccept = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            return setToast({ message: 'Please fill all fields', type: 'error' });
        }

        setLoading(true);
        try {
            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();

            // Post to backend to consume invite
            await axios.post(`/invitations/${token}/accept`,
                { name, email },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            // Set global auth token
            localStorage.setItem('token', idToken);
            // axios.defaults.headers.common['Authorization'] is already set above

            setToast({ message: 'Welcome aboard! Redirecting...', type: 'success' });
            setTimeout(() => {
                navigate('/dashboard'); // Staff dashboard
            }, 1000);

        } catch (error) {
            console.error(error);
            let errorMsg = error.response?.data?.message || 'Error accepting invitation';

            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'This email is already registered. Please login, or contact your admin if you believe this is an error.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'Password must be at least 6 characters.';
            }

            setToast({ message: errorMsg, type: 'error' });
            setLoading(false);
        }
    };

    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading Invite...</div>;

    if (status !== 'active') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-[16px] shadow-xl text-center">
                    <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Invalid Invite</h1>
                    <p className="text-slate-500">This invitation link has expired or doesn't exist.</p>
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
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 font-display">
                            Join {inviteData.firm_name}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Complete your staff profile and set a password
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleVerifyAndAccept}>

                        <Input
                            label="Your Full Name"
                            placeholder="E.g., Rahul Sharma"
                            icon={<User className="w-5 h-5 text-slate-400" />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            icon={<Mail className="w-5 h-5 text-slate-400" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled // Locked to the invited email usually, but we allow typing if empty
                            required
                        />

                        <Input
                            label="Set Password"
                            type="password"
                            icon={<Lock className="w-5 h-5 text-slate-400" />}
                            placeholder="Min 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" isLoading={loading} className="w-full bg-[#0F5C4A] hover:bg-[#0A4134] text-white py-3 rounded-xl transition-all" fullWidth>
                            Accept Invitation & Login
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default InviteAccept;
