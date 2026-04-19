import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { User, Mail, ArrowRight, Calendar, Users, Lock, Phone, Eye, EyeOff, BellRing } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import AuthSplitLayout from '../../components/auth/AuthSplitLayout';
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

    useEffect(() => {
        document.body.classList.add('auth-body-lock');
        document.documentElement.classList.add('auth-html-lock');

        return () => {
            document.body.classList.remove('auth-body-lock');
            document.documentElement.classList.remove('auth-html-lock');
        };
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
        <div className="h-screen flex overflow-hidden">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
            {loading ? <Loader type="fullscreen" text="Setting up your workspace..." /> : null}
            <AuthSplitLayout
                panelBadge="Premium SaaS Onboarding"
                panelTitle="Launch your CA workspace without the clutter."
                panelDescription="Start with a polished dashboard experience that feels aligned with the landing page and ready for real compliance operations."
                panelHighlights={signupHighlights}
                formEyebrow="Free setup"
                formTitle="Create Your Workspace"
                formDescription="Join VyaparOS with a cleaner full-screen signup flow built for modern firms and overflow-free desktop layouts."
                footer={(
                    <p className="text-center text-sm text-slate-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-700 transition-colors hover:text-fuchsia-600">
                            Log in here
                        </Link>
                    </p>
                )}
            >
                <form className="space-y-3 [@media_(max-height:1100px)]:space-y-2.5" onSubmit={handleSignup}>
                    <Input
                        id="name"
                        label={<span>Full Name <span className="text-fuchsia-500">*</span></span>}
                        placeholder="Amit Singh"
                        icon={<User className="h-5 w-5 text-slate-400" />}
                        value={formData.name}
                        onChange={handleChange}
                        required
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 [@media_(max-height:1100px)]:py-2.5"
                    />

                    <Input
                        id="email"
                        label={<span>Email Address <span className="text-fuchsia-500">*</span></span>}
                        placeholder="amit@example.com"
                        type="email"
                        icon={<Mail className="h-5 w-5 text-slate-400" />}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 [@media_(max-height:1100px)]:py-2.5"
                    />

                    <Input
                        id="phone"
                        label={<span>Phone Number <span className="text-fuchsia-500">*</span></span>}
                        placeholder="9876543210"
                        icon={<Phone className="h-5 w-5 text-slate-400" />}
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength={10}
                        required
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 [@media_(max-height:1100px)]:py-2.5"
                    />

                    <Input
                        id="password"
                        label={<span>Password <span className="text-fuchsia-500">*</span></span>}
                        placeholder="Min 6 characters"
                        type={showPassword ? 'text' : 'password'}
                        icon={<Lock className="h-5 w-5 text-slate-400" />}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 [@media_(max-height:1100px)]:py-2.5"
                        rightIcon={
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="flex items-center justify-center transition-colors hover:text-slate-700 focus:outline-none">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        }
                    />

                    <Input
                        id="confirmPassword"
                        label={<span>Confirm Password <span className="text-fuchsia-500">*</span></span>}
                        placeholder="Re-enter password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        icon={<Lock className="h-5 w-5 text-slate-400" />}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        error={isPasswordMismatch ? 'Passwords do not match' : ''}
                        inputClassName="rounded-2xl border-white/70 bg-white/85 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.16)] hover:border-blue-200 hover:bg-white focus:ring-blue-500 [@media_(max-height:1100px)]:py-2.5"
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

                    <div className="pt-0.5">
                        <Button
                            id="signup-button"
                            type="submit"
                            disabled={!isFormValid || loading}
                            isLoading={loading}
                            fullWidth
                            className={`w-full rounded-2xl py-3 text-base text-white transition-all duration-300 shadow-[0_22px_55px_-22px_rgba(99,102,241,0.85)] [@media_(max-height:1100px)]:py-2.5 ${isFormValid ? 'bg-[linear-gradient(135deg,#2563eb,#9333ea)] hover:scale-105 hover:shadow-[0_28px_65px_-24px_rgba(99,102,241,0.95)]' : 'bg-slate-300 shadow-none'}`}
                            rightIcon={!loading ? <ArrowRight className="h-4 w-4" /> : null}
                        >
                            {loading ? 'Creating Workspace...' : 'Create CA Dashboard'}
                        </Button>
                    </div>
                </form>
            </AuthSplitLayout>
        </div>
    );
};

export default Signup;
