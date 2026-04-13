import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

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
            console.log("TOKEN:", token);
            
            const res = await login(token);
            
            setToast({ message: 'Welcome back!', type: 'success' });
            const userRole = res.data?.user?.role || 'owner';
            
            setTimeout(() => {
                if (userRole === 'ca') {
                    navigate('/ca/dashboard');
                } else if (userRole === 'ca_staff' || userRole === 'ca_article') {
                    navigate('/dashboard'); // Staff dashboard
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 font-sans">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            <div className="max-w-md w-full">
                <div className="bg-white p-8 sm:p-10 rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2">
                            <Shield className="w-10 h-10 text-[#F5A623]" />
                            <span className="text-2xl font-bold text-[#0A2C4B] font-display">VyaparOS</span>
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2 font-display">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500">
                            Secure login to your Compliance Dashboard
                        </p>
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <Input
                            id="email"
                            label={<span>Email Address <span className="text-[#D98205]">*</span></span>}
                            placeholder="you@example.com"
                            type="email"
                            icon={<Mail className="w-5 h-5 text-slate-400" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoFocus
                        />

                        <div className="relative">
                            <Input
                                id="password"
                                label={<span>Password <span className="text-[#D98205]">*</span></span>}
                                placeholder="Enter your password"
                                type={showPassword ? 'text' : 'password'}
                                icon={<Lock className="w-5 h-5 text-slate-400" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                rightIcon={
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-700 transition-colors focus:outline-none flex items-center justify-center mr-1 mt-[2px]">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                }
                            />
                            {/* Move Forgot Password out of the absolute position if we are using rightIcon, otherwise it overlaps */}
                        </div>

                        <div className="flex justify-end mt-1">
                             <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-[13px] font-medium text-[#0F5C4A] hover:text-[#0A4134] transition-colors bg-transparent border-0 p-0"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <div className="pt-2">
                            <Button id="login-button" type="submit" isLoading={loading} className="w-full bg-[#0F5C4A] hover:bg-[#0A4134] text-white py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#0F5C4A]/20 flex justify-center items-center" fullWidth leftIcon={<Shield className="w-4 h-4" />}>
                                Secure Login
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex justify-center mb-4">
                            <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                                <Lock className="w-3.5 h-3.5 text-slate-400" /> Your data is encrypted & secure
                            </p>
                        </div>
                        <p className="text-center text-sm text-slate-600 mt-2">
                            New here?{' '}
                            <Link to="/signup" className="font-semibold text-[#0F5C4A] hover:text-[#0A4134] transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-8">
                    © {new Date().getFullYear()} VyaparOS. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default Login;
