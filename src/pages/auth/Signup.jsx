import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

import { User, Mail, ArrowRight, Shield, Check, Calendar, Users, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

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
            console.log("TOKEN:", token);
            
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
        <div className="min-h-screen lg:flex font-sans bg-slate-50">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Left Side (Illustration) */}
            <div className="hidden lg:flex lg:w-5/12 relative bg-[#0A2C4B] text-white p-12 overflow-hidden sticky top-0 h-screen">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A2C4B] via-[#08223d] to-[#1E3A8A]"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="relative z-10 w-full h-full flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-[#D98205]" />
                        <span className="text-2xl font-bold font-display tracking-tight">VyaparOS</span>
                    </div>

                    <div className="my-auto pr-8">
                        <h2 className="text-4xl font-bold mb-4 leading-tight">
                            Start Your CA Compliance Dashboard
                        </h2>
                        <p className="text-lg text-blue-200 mb-10">
                            Structured monitoring for disciplined CA firms.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#D98205]/10 flex items-center justify-center border border-[#D98205]/20 shadow-inner">
                                    <Users className="w-6 h-6 text-[#D98205]" />
                                </div>
                                <span className="text-lg font-medium text-blue-50 leading-snug">Built for Chartered Accountants</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 shrink-0 rounded-xl bg-[#D98205]/10 flex items-center justify-center border border-[#D98205]/20 shadow-inner">
                                    <Calendar className="w-6 h-6 text-[#D98205]" />
                                </div>
                                <span className="text-lg font-medium text-blue-50 leading-snug">Eliminate manual follow-ups</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 py-8 min-h-screen">
                <div className="w-full max-w-md bg-white p-6 sm:p-7 rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col relative w-full h-auto">
                    <div className="text-center mb-5">
                        <h1 className="text-2xl font-extrabold text-[#05172A] mb-1 font-display tracking-tight">
                            Create Your Free Account
                        </h1>
                        <p className="text-sm text-slate-500">
                            Built for Chartered Accountants managing multiple clients
                        </p>
                    </div>

                    <form className="space-y-4 flex-1 flex flex-col" onSubmit={handleSignup}>
                        <Input
                            id="name"
                            label={<span>Full Name <span className="text-[#D98205]">*</span></span>}
                            placeholder="Amit Singh"
                            icon={<User className="h-5 w-5" />}
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            id="email"
                            label={<span>Email Address <span className="text-[#D98205]">*</span></span>}
                            placeholder="amit@example.com"
                            type="email"
                            icon={<Mail className="h-5 w-5" />}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            id="phone"
                            label={<span>Phone Number <span className="text-[#D98205]">*</span></span>}
                            placeholder="9876543210"
                            icon={<Phone className="h-5 w-5 text-slate-400" />}
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength={10}
                            required
                        />

                        <Input
                            id="password"
                            label={<span>Password <span className="text-[#D98205]">*</span></span>}
                            placeholder="Min 6 characters"
                            type={showPassword ? 'text' : 'password'}
                            icon={<Lock className="h-5 w-5" />}
                            value={formData.password}
                            onChange={handleChange}
                            required
                            rightIcon={
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-700 transition-colors focus:outline-none flex items-center justify-center">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            }
                        />

                        <div>
                            <Input
                                id="confirmPassword"
                                label={<span>Confirm Password <span className="text-[#D98205]">*</span></span>}
                                placeholder="Re-enter password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                icon={<Lock className="h-5 w-5" />}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                error={isPasswordMismatch ? 'Passwords do not match' : ''}
                                className={isPasswordMismatch ? 'mb-0' : ''}
                                rightIcon={
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="hover:text-slate-700 transition-colors focus:outline-none flex items-center justify-center">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                        </div>

                        <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                            <input id="terms" type="checkbox" required className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B] transition-colors cursor-pointer" />
                            <label htmlFor="terms" className="text-[11px] text-slate-500 leading-tight cursor-pointer select-none">
                                I agree to the <Link to="#" className="text-[#0A2C4B] hover:text-[#1E3A8A] font-medium transition-colors">Terms</Link> and <Link to="#" className="text-[#0A2C4B] hover:text-[#1E3A8A] font-medium transition-colors">Privacy Policy</Link>
                            </label>
                        </div>

                        <div className="pt-2">
                            <Button 
                                id="signup-button" 
                                type="submit" 
                                disabled={!isFormValid || loading}
                                isLoading={loading} 
                                variant="unstyled" 
                                className={`w-full text-white py-2.5 rounded-xl transition-all shadow-md flex justify-center items-center ${isFormValid ? 'bg-[#D98205] hover:bg-[#B46A04] shadow-[#D98205]/20' : 'bg-slate-300 cursor-not-allowed shadow-none'}`} 
                                fullWidth 
                                rightIcon={<ArrowRight className="h-4 w-4" />}
                            >
                                Create CA Dashboard
                            </Button>
                        </div>

                        <div className="mt-4">
                            <p className="text-center text-sm text-slate-600 border-t border-slate-100 pt-4">
                                Already have an account?{' '}
                                <Link to="/login" className="font-semibold text-[#0A2C4B] hover:text-[#1E3A8A] transition-colors">
                                    Log in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
