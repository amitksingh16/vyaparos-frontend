import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, BellRing, Sparkles, Shield } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import Loader from '../../components/common/Loader';

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
        <div className="min-h-screen w-full bg-[#0a192f] relative flex flex-col items-center justify-center py-8 lg:py-10 px-4 sm:px-6">

            {/* Custom CSS for Floating Neon Orbs */}
            <style>
                {`
                @keyframes float-orbs {
                    0% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
                    33% { transform: translate(40px, -50px) scale(1.1); opacity: 0.9; }
                    66% { transform: translate(-30px, 40px) scale(0.9); opacity: 0.8; }
                    100% { transform: translate(0px, 0px) scale(1); opacity: 0.7; }
                }
                .animate-ambient-float {
                    animation: float-orbs 15s infinite ease-in-out;
                }
                `}
            </style>

            {/* Neon Background Orbs */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                {[
                    { top: '10%', left: '15%', size: '300px', delay: '0s', color: 'bg-blue-500/70' },
                    { top: '65%', left: '5%', size: '350px', delay: '-5s', color: 'bg-purple-500/60' },
                    { top: '30%', left: '80%', size: '320px', delay: '-2s', color: 'bg-cyan-500/60' },
                    { top: '85%', left: '70%', size: '280px', delay: '-7s', color: 'bg-indigo-500/70' },
                    { top: '40%', left: '50%', size: '400px', delay: '-10s', color: 'bg-fuchsia-500/50' },
                ].map((orb, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full blur-3xl animate-ambient-float mix-blend-screen ${orb.color}`}
                        style={{
                            top: orb.top,
                            left: orb.left,
                            width: orb.size,
                            height: orb.size,
                            animationDelay: orb.delay,
                        }}
                    />
                ))}
            </div>

            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            {loading ? <Loader type="fullscreen" text="Loading your workspace..." /> : null}

            {/* Main Content Layout */}
            <div className="w-full flex justify-center relative z-10">
                <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto gap-y-6 lg:gap-y-0">

                    {/* LEFT PANEL */}
                    <div className="flex w-full lg:w-1/2 flex-col items-center lg:items-start justify-center px-4 lg:px-20 py-2 lg:py-6">
                        <div className="relative z-10 w-full max-w-lg flex flex-col items-center lg:items-start">
                            <div className="flex flex-col lg:flex-row items-center gap-3 mb-4 lg:mb-8 text-center lg:text-left">
                                <div className="flex h-16 w-16 lg:h-24 lg:w-24 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
                                    <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-amber-300" />
                                </div>
                                <div>
                                    <div className="font-display text-xl lg:text-2xl font-bold tracking-tight text-white mt-2 lg:mt-0">VyaparOS</div>
                                    <div className="text-xs lg:text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        Premium Workspace
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-2xl lg:text-5xl font-black leading-[1.2] lg:leading-[0.98] tracking-[-0.05em] text-white xl:text-6xl mb-3 lg:mb-5 text-center lg:text-left">
                                Step back into your firm's digital control room.
                            </h1>
                            <p className="mt-2 lg:mt-5 max-w-[95%] lg:max-w-[92%] text-sm lg:text-lg leading-relaxed lg:leading-8 text-slate-300 mb-6 lg:mb-8 text-center lg:text-left">
                                Login to a calmer, sharper workspace built for deadline discipline, client visibility, and premium CA operations.
                            </p>

                            <div className="hidden lg:flex flex-col gap-3">
                                {loginHighlights.map(({ icon: Icon, title, description }) => (
                                    <div
                                        key={title}
                                        className="rounded-[1.6rem] border border-white/12 bg-white/8 px-4 py-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.95)] backdrop-blur-2xl"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                                                <Icon className="h-5 w-5 text-blue-200" />
                                            </div>
                                            <div>
                                                <div className="text-base font-semibold text-white">{title}</div>
                                                <div className="mt-1 text-sm leading-6 text-slate-300">{description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-0 sm:px-8 lg:px-16 py-6">
                        <div className="w-[90%] sm:max-w-[400px] my-8 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10 hover:shadow-2xl transition-all duration-300 shrink-0">
                            <div className="mb-5">
                                <div className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 mb-4">
                                    Secure Access
                                </div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-[-0.05em] text-gray-800">
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
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
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
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
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

                                <div className="mt-4 sm:mt-6">
                                    <Button
                                        id="login-button"
                                        type="submit"
                                        isLoading={loading}
                                        disabled={loading}
                                        fullWidth
                                        className="w-full h-10 sm:h-12 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#9333ea)] text-sm sm:text-base text-white transition-all duration-300 shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] hover:scale-105 hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]"
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