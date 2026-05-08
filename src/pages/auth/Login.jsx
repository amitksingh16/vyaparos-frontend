import { createElement, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, BellRing, Sparkles, Shield } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import Loader from '../../components/common/Loader';
import AuthAmbientBackground from '../../components/auth/AuthAmbientBackground';

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

    // Scrolling to top smoothly on mount, removing body locks that caused truncation
    useEffect(() => {
        window.scrollTo(0, 0);
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
        <div className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a192f] px-4 py-5 sm:px-6 lg:h-screen lg:overflow-hidden lg:py-4">
            <AuthAmbientBackground />

            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            {loading ? <Loader type="fullscreen" text="Loading your workspace..." /> : null}

            {/* Main Content Layout */}
            <div className="relative z-10 flex w-full justify-center">
                <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-y-5 lg:h-[calc(100vh-2rem)] lg:flex-row lg:gap-y-0">

                    {/* LEFT PANEL */}
                    <div className="flex w-full flex-col items-center justify-center px-4 py-2 lg:w-1/2 lg:items-start lg:px-16 lg:py-4 xl:px-20">
                        <div className="relative z-10 w-full max-w-lg flex flex-col items-center lg:items-start">
                            <div className="mb-4 flex flex-col items-center gap-3 text-center lg:mb-6 lg:flex-row lg:text-left">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl lg:h-20 lg:w-20 xl:h-24 xl:w-24">
                                    <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-amber-300" />
                                </div>
                                <div>
                                    <div className="font-display text-xl font-bold tracking-normal text-white lg:mt-0 lg:text-2xl">VyaparOS</div>
                                    <div className="text-xs lg:text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        Premium Workspace
                                    </div>
                                </div>
                            </div>

                            <h1 className="mb-3 text-center text-2xl font-black leading-[1.16] tracking-normal text-white lg:mb-4 lg:text-left lg:text-4xl lg:leading-[1.02] xl:text-6xl">
                                Step back into your firm's digital control room.
                            </h1>
                            <p className="mb-5 mt-1 max-w-[95%] text-center text-sm leading-relaxed text-slate-300 lg:mb-6 lg:max-w-[92%] lg:text-left lg:text-base lg:leading-7 xl:text-lg xl:leading-8">
                                Login to a calmer, sharper workspace built for deadline discipline, client visibility, and premium CA operations.
                            </p>

                            <div className="hidden flex-col gap-2.5 lg:flex">
                                {loginHighlights.map((highlight) => (
                                    <div
                                        key={highlight.title}
                                        className="group rounded-[1.35rem] border border-white/12 bg-white/8 px-4 py-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.95)] backdrop-blur-2xl transition-colors duration-300 hover:border-white/20 hover:bg-white/12"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10 transition-colors duration-300 group-hover:bg-white/15">
                                                {createElement(highlight.icon, { className: 'h-5 w-5 text-blue-200' })}
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-white">{highlight.title}</div>
                                                <div className="mt-1 text-sm leading-6 text-slate-300">{highlight.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="flex w-full flex-col items-center justify-center px-0 py-2 sm:px-8 lg:w-1/2 lg:px-12 lg:py-3 xl:px-16">
                        <div className="relative w-[90%] shrink-0 overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-5 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.75)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_36px_90px_-42px_rgba(99,102,241,0.55)] sm:max-w-[400px] sm:p-7 lg:p-8 xl:p-9">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-400/20 blur-3xl" />
                            <div className="relative mb-4">
                                <div className="mb-3 inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                                    Secure Access
                                </div>
                                <h2 className="text-xl font-black tracking-normal text-gray-800 sm:text-2xl lg:text-[1.65rem]">
                                    Welcome Back
                                </h2>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                                    Secure login to your premium compliance dashboard with fast access to filings, team actions, and client timelines.
                                </p>
                            </div>

                            <form className="flex flex-col gap-y-3 sm:gap-y-5" onSubmit={handleLogin}>
                                <Input
                                    id="email"
                                    label={<span className="text-sm sm:text-base">Email Address <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="you@example.com"
                                    type="email"
                                    icon={<Mail className="h-5 w-5 text-slate-400" />}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    disableMotion
                                    inputClassName="w-full h-10 sm:h-11 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                />

                                <Input
                                    id="password"
                                    label={<span className="text-sm sm:text-base">Password <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Enter your password"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={<Lock className="h-5 w-5 text-slate-400" />}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disableMotion
                                    inputClassName="w-full h-10 sm:h-11 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                    rightIcon={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-sm">
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

                                <div className="relative mt-3 sm:mt-4">
                                    <div className="pointer-events-none absolute -inset-2 rounded-[1.4rem] bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-fuchsia-500/25 opacity-80 blur-xl transition-opacity duration-300" />
                                    <Button
                                        id="login-button"
                                        type="submit"
                                        isLoading={loading}
                                        disabled={loading}
                                        disableMotion
                                        fullWidth
                                        className="relative z-10 w-full h-10 sm:h-11 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#9333ea)] text-sm text-white transition-shadow duration-300 shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]"
                                        leftIcon={<Sparkles className="h-4 w-4" />}
                                        rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : null}
                                    >
                                        {loading ? 'Signing In...' : 'Secure Login'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 border-t border-slate-200/70 pt-4 text-center">
                                <p className="text-sm text-slate-600">
                                    New here?{' '}
                                    <Link to="/signup" className="font-semibold text-blue-700 transition-colors hover:text-fuchsia-600">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
