import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, BellRing, Sparkles } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';

const loginHighlights = [
    {
        icon: CheckCircle2,
        title: 'Portfolio-wide visibility',
        description: 'Track filings, clients, and staff workload from one premium control room.',
    },
    {
        icon: BellRing,
        title: 'Deadline-first workflow',
        description: 'Stay ahead with proactive alerts and cleaner daily prioritization.',
    },
    {
        icon: Sparkles,
        title: 'Designed for modern firms',
        description: 'A polished glassmorphic workspace that feels as sharp as your practice.',
    },
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add('auth-body-lock');
        document.documentElement.classList.add('auth-html-lock');

        return () => {
            document.body.classList.remove('auth-body-lock');
            document.documentElement.classList.remove('auth-html-lock');
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email || !password) {
            setToast({ message: 'Please enter both email and password', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            const res = await login(token);

            setToast({ message: 'Welcome back!', type: 'success' });
            const userRole = res.data?.user?.role || 'owner';

            setTimeout(() => {
                if (userRole === 'ca') {
                    navigate('/ca/dashboard');
                } else if (userRole === 'ca_staff' || userRole === 'ca_article') {
                    navigate('/dashboard');
                } else {
                    navigate('/dashboard');
                }
            }, 500);
        } catch (error) {
            console.error('Firebase Login Error:', error.code, error.message);

            let errMsg = error.response?.data?.message || (error.code?.startsWith('auth/') ? error.message.replace('Firebase: ', '') : 'Login failed.');

            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errMsg = 'Invalid Email or Password.';
            } else if (error.code === 'auth/too-many-requests') {
                errMsg = 'Too many failed login attempts. Try again later or reset password.';
            }

            setToast({ message: errMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setToast({ message: 'Please enter your email address first', type: 'error' });
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setToast({ message: 'Password reset email sent! Check your inbox.', type: 'success' });
        } catch (error) {
            console.error('Forgot Password Error:', error);
            setToast({ message: 'Failed to send reset email. Ensure your email is correct.', type: 'error' });
        }
    };

    return (
        <div className="min-h-[100dvh] overflow-hidden">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            <AuthSplitLayout
                panelBadge="Premium Compliance Workspace"
                panelTitle="Step back into your firm's digital control room."
                panelDescription="Login to a calmer, sharper workspace built for deadline discipline, client visibility, and premium CA operations."
                panelHighlights={loginHighlights}
                formEyebrow="Secure access"
                formTitle="Welcome Back"
                formDescription="Secure login to your premium compliance dashboard with fast access to filings, team actions, and client timelines."
                footer={(
                    <p className="text-center text-sm text-slate-600">
                        New here?{' '}
                        <Link to="/signup" className="font-semibold text-blue-700 transition-colors hover:text-fuchsia-600">
                            Create account
                        </Link>
                    </p>
                )}
            >
                <form className="space-y-5" onSubmit={handleLogin}>
                    <Input
                        id="email"
                        label={<span>Email Address <span className="text-fuchsia-500">*</span></span>}
                        placeholder="you@example.com"
                        type="email"
                        icon={<Mail className="h-5 w-5 text-slate-400" />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3.5 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500"
                    />

                    <Input
                        id="password"
                        label={<span>Password <span className="text-fuchsia-500">*</span></span>}
                        placeholder="Enter your password"
                        type={showPassword ? 'text' : 'password'}
                        icon={<Lock className="h-5 w-5 text-slate-400" />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3.5 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500"
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    <div className="flex items-center justify-between gap-4 text-sm">
                        <p className="rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 font-medium text-emerald-700">
                            Encrypted session security enabled
                        </p>
                        <button
                            type="button"
                            onClick={handleForgotPassword}
                            className="font-semibold text-slate-600 transition-colors hover:text-blue-700"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <div className="pt-2">
                        <Button
                            id="login-button"
                            type="submit"
                            isLoading={loading}
                            disabled={loading}
                            fullWidth
                            className="w-full rounded-2xl bg-[linear-gradient(135deg,#2563eb,#9333ea)] py-3.5 text-base text-white shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] hover:-translate-y-0.5 hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]"
                            leftIcon={<Sparkles className="h-4 w-4" />}
                            rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : null}
                        >
                            {loading ? 'Signing In...' : 'Secure Login'}
                        </Button>
                    </div>
                </form>
            </AuthSplitLayout>
        </div>
    );
};

export default Login;
