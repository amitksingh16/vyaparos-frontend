import { createElement, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { User, Mail, ArrowRight, Calendar, Users, Lock, Phone, Eye, EyeOff, BellRing, Shield } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import Loader from '../../components/common/Loader';
import AuthAmbientBackground from '../../components/auth/AuthAmbientBackground';

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
        <div className="relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-[#0a192f] px-4 py-5 sm:px-6 lg:py-4">
            <AuthAmbientBackground />

            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            {loading ? <Loader type="fullscreen" text="Setting up your workspace..." /> : null}

            {/* MAIN CONTENT WRAPPER - Fixed Layout for proper scrolling */}
            <div className="relative z-10 flex w-full justify-center">
                <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-y-5 lg:min-h-[calc(100vh-2rem)] lg:flex-row lg:gap-y-0">

                    {/* LEFT PANEL */}
                    <div className="flex w-full flex-col items-center justify-center px-4 py-2 lg:w-1/2 lg:items-start lg:px-16 lg:pt-8 lg:pb-3 xl:px-20 xl:pt-10 xl:pb-4">
                        <div className="relative z-10 w-full max-w-lg flex flex-col items-center lg:items-start">
                            <div className="mb-3 flex flex-col items-center gap-3 text-center lg:mb-4 lg:flex-row lg:text-left">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl lg:h-20 lg:w-20 xl:h-24 xl:w-24">
                                    <Shield className="h-8 w-8 lg:h-10 lg:w-10 text-amber-300" />
                                </div>
                                <div>
                                    <div className="font-display text-xl font-bold tracking-normal text-white lg:mt-0 lg:text-2xl">VyaparOS</div>
                                    <div className="text-xs lg:text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        Compliance OS
                                    </div>
                                </div>
                            </div>

                            <h1 className="mb-2 text-center text-2xl font-black leading-[1.16] tracking-normal text-white lg:mb-3 lg:text-left lg:text-[1.9rem] lg:leading-[1.06] xl:text-[2.75rem]">
                                Launch your CA workspace without the clutter.
                            </h1>
                            <p className="mb-4 mt-1 max-w-[95%] text-center text-sm leading-relaxed text-slate-300 lg:mb-4 lg:max-w-[92%] lg:text-left lg:text-[0.95rem] lg:leading-6 xl:text-base xl:leading-7">
                                Start with a polished dashboard experience that feels aligned with the landing page and ready for real compliance operations.
                            </p>

                            <div className="hidden flex-col gap-2 lg:flex">
                                {signupHighlights.map((highlight) => (
                                    <div
                                        key={highlight.title}
                                        className="group rounded-[1.35rem] border border-white/12 bg-white/8 px-3.5 py-2.5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.95)] backdrop-blur-2xl transition-colors duration-300 hover:border-white/20 hover:bg-white/12"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10 transition-colors duration-300 group-hover:bg-white/15">
                                                {createElement(highlight.icon, { className: 'h-4 w-4 text-blue-200' })}
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-white">{highlight.title}</div>
                                                <div className="mt-0.5 text-xs leading-5 text-slate-300">{highlight.description}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM */}
                    <div className="flex w-full flex-col items-center justify-center px-0 py-2 sm:px-8 lg:w-1/2 lg:px-10 lg:py-1 xl:px-16">
                        <div className="relative h-auto w-full max-w-md overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-4 !pb-8 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.75)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_36px_90px_-42px_rgba(99,102,241,0.55)] sm:p-5 sm:!pb-8 lg:p-4 lg:!pb-8 xl:p-5 xl:!pb-8">
                            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-fuchsia-400/18 blur-3xl" />
                            <div className="relative mb-2">
                                <div className="mb-1.5 inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                                    Free setup
                                </div>
                                <h2 className="text-xl font-black tracking-normal text-gray-800 sm:text-2xl lg:text-[1.55rem]">
                                    Create Your Workspace
                                </h2>
                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                    Join VyaparOS with a cleaner full-screen signup flow built for modern firms and overflow-free desktop layouts.
                                </p>
                            </div>

                            <form className="flex flex-col gap-y-1.5" onSubmit={handleSignup}>
                                <Input
                                    id="name"
                                    label={<span className="text-xs">Full Name <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Amit Singh"
                                    icon={<User className="h-5 w-5 text-slate-400" />}
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disableMotion
                                    inputClassName="w-full h-9 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                />

                                <Input
                                    id="email"
                                    label={<span className="text-xs">Email Address <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="amit@example.com"
                                    type="email"
                                    icon={<Mail className="h-5 w-5 text-slate-400" />}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disableMotion
                                    inputClassName="w-full h-9 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                />

                                <Input
                                    id="phone"
                                    label={<span className="text-xs">Phone Number <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="9876543210"
                                    icon={<Phone className="h-5 w-5 text-slate-400" />}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    maxLength={10}
                                    required
                                    disableMotion
                                    inputClassName="w-full h-9 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                />

                                <Input
                                    id="password"
                                    label={<span className="text-xs">Password <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Min 6 characters"
                                    type={showPassword ? 'text' : 'password'}
                                    icon={<Lock className="h-5 w-5 text-slate-400" />}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disableMotion
                                    inputClassName="w-full h-9 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                    rightIcon={
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <Input
                                    id="confirmPassword"
                                    label={<span className="text-xs">Confirm Password <span className="text-fuchsia-500">*</span></span>}
                                    placeholder="Re-enter password"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    icon={<Lock className="h-5 w-5 text-slate-400" />}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    error={isPasswordMismatch ? 'Passwords do not match' : ''}
                                    disableMotion
                                    inputClassName="w-full h-9 rounded-2xl border-white/70 bg-white/85 px-4 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 text-sm"
                                    rightIcon={
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    }
                                />

                                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/75 px-3.5 py-1.5 shadow-[0_10px_30px_rgba(148,163,184,0.12)]">
                                    <input id="terms" type="checkbox" required className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 transition-colors focus:ring-blue-500" />
                                    <label htmlFor="terms" className="cursor-pointer select-none text-xs leading-5 text-slate-500">
                                        I agree to the <Link to="#" className="font-medium text-blue-700 transition-colors hover:text-fuchsia-600">Terms</Link> and <Link to="#" className="font-medium text-blue-700 transition-colors hover:text-fuchsia-600">Privacy Policy</Link>.
                                    </label>
                                </div>

                                <div className="relative mt-1">
                                    <div className="pointer-events-none absolute -inset-2 rounded-[1.4rem] bg-gradient-to-r from-blue-500/25 via-indigo-500/25 to-fuchsia-500/25 opacity-80 blur-xl transition-opacity duration-300" />
                                    <Button
                                        id="signup-button"
                                        type="submit"
                                        disabled={!isFormValid || loading}
                                        isLoading={loading}
                                        disableMotion
                                        fullWidth
                                        className={`relative z-10 w-full h-10 rounded-2xl text-sm text-white transition-shadow duration-300 shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] ${isFormValid ? 'bg-[linear-gradient(135deg,#2563eb,#9333ea)] hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]' : 'bg-slate-300 shadow-none'}`}
                                        rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : null}
                                    >
                                        {loading ? 'Creating Workspace...' : 'Create CA Dashboard'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-3 border-t border-slate-200/70 pt-3 text-center">
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
