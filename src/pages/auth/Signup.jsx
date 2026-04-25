import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { User, Mail, ArrowRight, Calendar, Users, Lock, Phone, Eye, EyeOff, BellRing, Shield } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import Loader from '../../components/common/Loader';

const signupHighlights = [
    {
        icon: Users,
        title: 'Built for CA firms',
        description: 'Create a workspace designed around client portfolios, staff coordination, and recurring compliance.',
    },
    {
        icon: Calendar,
        title: 'Deadline-ready from day one',
        description: 'Structured onboarding helps you go from signup to active compliance tracking without friction.',
    },
    {
        icon: BellRing,
        title: 'Less chasing, more control',
        description: 'Automate reminders and bring every important next step into one premium dashboard.',
    },
];

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'ca'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const { register } = useAuth();
    const navigate = useNavigate();

    // REMOVED the auth-body-lock useEffect. That was causing the 100% zoom truncation!
    useEffect(() => {
        // Just scroll to top on mount for a fresh feel
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.id === 'phone') {
            value = value.replace(/\D/g, '');
        }
        setFormData({ ...formData, [e.target.id]: value });
    };

    const isPasswordMismatch = formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword;
    const isFormValid = formData.name && formData.email && formData.password && formData.confirmPassword && formData.phone && !isPasswordMismatch;

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            if (isPasswordMismatch) {
                return setToast({ message: 'Passwords do not match', type: 'error' });
            }
            return setToast({ message: 'Please fill all required fields correctly', type: 'error' });
        }

        setLoading(true);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setToast({ message: 'Please enter a valid email address', type: 'error' });
            setLoading(false);
            return;
        }

        if (formData.phone.length < 10) {
            setToast({ message: 'Please enter a valid 10-digit phone number', type: 'error' });
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const token = await userCredential.user.getIdToken();

            await register(formData.email, formData.name, formData.role, formData.phone, token);

            setToast({ message: 'Account Created! Redirecting...', type: 'success' });
            setTimeout(() => navigate('/onboarding/ca'), 1000);
        } catch (error) {
            console.error('Firebase Auth Error:', error.code, error.message);

            let errorMsg = error.response?.data?.message || (error.code?.startsWith('auth/') ? error.message.replace('Firebase: ', '') : 'Error creating account.');

            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'This email is already in use. Try logging in.';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'Password should be at least 6 characters.';
            }

            setToast({ message: errorMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a192f] relative flex flex-col items-center justify-center py-10 px-4 sm:px-6">

            {/* INJECTED CUSTOM CSS FOR FLOATING ORBS & SCROLLBAR */}
            <style>
                {`
                @keyframes float-orbs {
                    0% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
                    33% { transform: translate(40px, -50px) scale(1.1); opacity: 0.6; }
                    66% { transform: translate(-30px, 40px) scale(0.9); opacity: 0.4; }
                    100% { transform: translate(0px, 0px) scale(1); opacity: 0.3; }
                }
                .animate-ambient-float {
                    animation: float-orbs 15s infinite ease-in-out;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(147, 51, 234, 0.5);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(147, 51, 234, 0.8);
                }
                `}
            </style>

            {/* FLOATING BACKGROUND ORBS */}
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
            {loading ? <Loader type="fullscreen" text="Setting up your workspace..." /> : null}

            {/* MAIN CONTENT WRAPPER - Fixed Layout for proper scrolling */}
            <div className="w-full flex justify-center relative z-10">
                <div className="flex flex-col lg:flex-row w-full max-w-[1400px] mx-auto">

                    {/* LEFT PANEL */}
                    <div className="hidden lg:flex w-1/2 flex-col justify-center px-12 lg:px-20 py-6">
                        <div className="relative z-10 w-full max-w-lg">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
                                    <Shield className="h-6 w-6 text-amber-300" />
                                </div>
                                <div>
                                    <div className="font-display text-2xl font-bold tracking-tight text-white">VyaparOS</div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        Compliance OS
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white xl:text-6xl mb-5">
                                Launch your CA workspace without the clutter.
                            </h1>
                            <p className="mt-5 max-w-[92%] text-lg leading-8 text-slate-300 mb-8">
                                Start with a polished dashboard experience that feels aligned with the landing page and ready for real compliance operations.
                            </p>

                            <div className="flex flex-col gap-3">
                                {signupHighlights.map(({ icon: Icon, title, description }) => (
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
                        <div className="w-full max-w-md h-auto bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-5 sm:p-8 lg:p-10 hover:shadow-2xl transition-all duration-300">
                            <div className="mb-5">
                                <div className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 mb-4">
                                    Free setup
                                </div>
                                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-[-0.05em] text-gray-800">
                                    Create Your Workspace
                                </h2>
                                <p className="mt-2 text-xs sm:text-sm text-slate-600">
                                    Join VyaparOS with a cleaner full-screen signup flow built for modern firms and overflow-free desktop layouts.
                                </p>
                            </div>

                            <form className="flex flex-col gap-y-3 sm:gap-y-5" onSubmit={handleSignup}>
                                <Input
                                    id="name"
                                    label={<span className="text-sm sm:text-base">Full Name <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Amit Singh"
                                    icon={<User className="h-5 w-5 text-slate-400" />}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
                                />

                                <Input
                                    id="email"
                                    label={<span className="text-sm sm:text-base">Email Address <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="amit@example.com"
                                    type="email"
                                    icon={<Mail className="h-5 w-5 text-slate-400" />}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
                                />

                                <Input
                                    id="phone"
                                    label={<span className="text-sm sm:text-base">Phone Number <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="9876543210"
                                    icon={<Phone className="h-5 w-5 text-slate-400" />}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    required
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
                                />

                                <Input
                                    id="password"
                                    label={<span className="text-sm sm:text-base">Password <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Min 6 characters"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={<Lock className="h-5 w-5 text-slate-400" />}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
                                    rightIcon={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <Input
                                    id="confirmPassword"
                                    label={<span className="text-sm sm:text-base">Confirm Password <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Re-enter password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    icon={<Lock className="h-5 w-5 text-slate-400" />}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    error={isPasswordMismatch ? 'Passwords do not match' : ''}
                                    inputClassName="w-full h-10 sm:h-12 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm sm:text-base"
                                    rightIcon={
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-2.5 shadow-[0_10px_30px_rgba(148,163,184,0.12)] [@media_(max-height:1100px)]:px-3.5 [@media_(max-height:1100px)]:py-2">
                                    <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500" />
                                    <label htmlFor="terms" className="cursor-pointer select-none text-xs leading-6 text-slate-500">
                                        I agree to the <Link to="#" className="font-medium text-blue-700 transition-colors hover:text-fuchsia-600">Terms</Link> and <Link to="#" className="font-medium text-blue-700 transition-colors hover:text-fuchsia-600">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <div className="mt-4 sm:mt-6">
                                    <Button
                                        id="signup-button"
                                        type="submit"
                                        disabled={!isFormValid || loading}
                                        isLoading={loading}
                                        fullWidth
                                        className={`w-full h-10 sm:h-12 rounded-2xl text-sm sm:text-base text-white transition-all duration-300 shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] ${isFormValid ? 'bg-[linear-gradient(135deg,#2563eb,#9333ea)] hover:scale-105 hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]' : 'bg-slate-300 shadow-none'}`}
                                        rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : null}
                                    >
                                        {loading ? 'Creating Workspace...' : 'Create CA Dashboard'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-4 border-t border-slate-200/70 pt-4 text-center">
                                <p className="text-sm text-slate-600">
                                    Already have an account?{' '}
                                    <Link to="/login" className="font-semibold text-blue-700 transition-colors hover:text-fuchsia-600">
                                        Log in here
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

export default Signup;