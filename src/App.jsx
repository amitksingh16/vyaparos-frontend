import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import BusinessProfile from './pages/onboarding/BusinessProfile';
import OnboardingSetupModal from './components/ca/OnboardingSetupModal';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/compliance/Calendar';
import CADashboard from './pages/ca/CADashboard';
import StaffSetup from './pages/auth/StaffSetup';
import InviteAccept from './pages/auth/InviteAccept';
import SetupPassword from './pages/auth/SetupPassword';
import Home from './pages/Home';

// Profile Pages
import Profile from './pages/profile/Profile';
import Settings from './pages/profile/Settings';
import Billing from './pages/profile/Billing';
import Support from './pages/profile/Support';

const ProtectedRoute = ({ children, requireSetup = true, blockIfSetupComplete = false, requireRole = null }) => {
    const { token, user, loading, onboardingComplete } = useAuth();
    console.log('ProtectedRoute: State check', { token, loading, user });

    if (loading) return <div>Loading...</div>;
    if (!token) {
        console.warn('ProtectedRoute: No token, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (user) {
        // If route requires a specific role and user doesn't have it, redirect
        if (requireRole) {
            const hasRole = Array.isArray(requireRole) ? requireRole.includes(user.role) : user.role === requireRole;
            if (!hasRole) {
                console.warn(`ProtectedRoute: User lacks role ${requireRole}, redirecting...`);
                const isCAFamily = ['ca', 'ca_staff', 'ca_article'].includes(user.role);
                return <Navigate to={isCAFamily ? '/ca/dashboard' : '/dashboard'} replace />;
            }
        }
        // If route requires setup but user hasn't completed it, force them to onboarding
        const userOnboardingComplete = onboardingComplete || user.isOnboardingComplete || user.setup_completed;

        if (requireSetup && !userOnboardingComplete) {
            console.warn('ProtectedRoute: User needs to complete setup, redirecting...');
            return <Navigate to={user.role === 'ca' ? '/onboarding/ca' : '/onboarding/business'} replace />;
        }

        // If route is specifically for onboarding, but user already did it, boot to dashboard
        if (blockIfSetupComplete && userOnboardingComplete) {
            console.warn('ProtectedRoute: Setup already completed, preventing access...');
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

const DashboardRoute = () => {
    const { user } = useAuth();

    if (['ca', 'ca_staff', 'ca_article'].includes(user?.role)) {
        return <Navigate to="/ca/dashboard" replace />;
    }

    return <Dashboard />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                            path="/onboarding/business"
                            element={
                                <ProtectedRoute requireSetup={false} blockIfSetupComplete={true}>
                                    <BusinessProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/onboarding/ca"
                            element={
                                <ProtectedRoute requireRole="ca" requireSetup={false} blockIfSetupComplete={true}>
                                    <OnboardingSetupModal isOpen={true} currentStep={1} percentComplete={0} completedSteps={0} totalSteps={3} />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardRoute />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/compliance"
                            element={
                                <ProtectedRoute requireRole="owner">
                                    <Calendar />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/ca/dashboard"
                            element={
                                <ProtectedRoute requireRole={['ca', 'ca_staff', 'ca_article']} requireSetup={false}>
                                    <CADashboard />
                                </ProtectedRoute>
                            }
                        />
                        {/* We reuse the owner dashboard for the client detail view */}
                        <Route
                            path="/ca/client/:id"
                            element={
                                <ProtectedRoute requireRole={['ca', 'ca_staff', 'ca_article']} requireSetup={false}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Profile & Settings Routes */}
                        <Route path="/profile" element={<ProtectedRoute requireSetup={false}><Profile /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute requireSetup={false}><Settings /></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute requireRole={['ca', 'owner']} requireSetup={false}><Billing /></ProtectedRoute>} />
                        <Route path="/support" element={<ProtectedRoute requireSetup={false}><Support /></ProtectedRoute>} />

                        <Route path="/staff-setup" element={<StaffSetup />} />
                        <Route path="/invite/:token" element={<InviteAccept />} />
                        <Route path="/setup-password" element={<SetupPassword />} />
                        <Route path="/" element={<Home />} />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
