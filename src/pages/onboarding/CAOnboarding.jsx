import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../src/context/AuthContext';
import { Building, Users, CheckCircle2, ArrowRight, Shield, Rocket, UserPlus, Briefcase, FileText } from 'lucide-react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa",
    "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka",
    "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const CAOnboarding = () => {
    const navigate = useNavigate();
    const { fetchUser } = useAuth();

    // Steps: 0 = Welcome, 1 = Firm Setup, 2 = Team & Activation, 3 = Confirmation
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        // Firm Details
        firm_name: '',
        client_count: '1-50',
        firm_filing_preference: 'mixed',

        // Team Details
        teamMembers: []
    });

    const handleAddTeamMember = () => {
        setFormData({
            ...formData,
            teamMembers: [...formData.teamMembers, { name: '', email: '', canOnboardClients: false }]
        });
    };

    const handleTeamMemberChange = (index, field, value) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers[index][field] = value;
        setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const handleRemoveTeamMember = (index) => {
        const updatedMembers = [...formData.teamMembers];
        updatedMembers.splice(index, 1);
        setFormData({ ...formData, teamMembers: updatedMembers });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleNext = () => {
        if (step === 1 && !formData.firm_name) {
            setToast({ message: "Firm Name is required", type: "error" });
            return;
        }
        if (step === 2) {
            // Validate all current team members
            for (let i = 0; i < formData.teamMembers.length; i++) {
                const member = formData.teamMembers[i];
                if (!member.name || !member.email) {
                    setToast({ message: "Please fill in all Name and Email fields for added team members", type: "error" });
                    return;
                }
            }
            handleSubmit();
        } else {
            setStep(step + 1);
        }
    };

    const handleSkipTeam = () => {
        setFormData({ ...formData, teamMembers: [] });
        handleSubmit();
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = { ...formData };

            // Move to visual confirming state early to show the UI
            setStep(3);

            await axios.post('/ca/setup', payload);

            // Re-fetch user to get updated setup_completed status
            await fetchUser();

            // Wait a moment for the user to read the success message before redirecting
            setTimeout(() => navigate('/ca/dashboard'), 2500);
        } catch (error) {
            console.error('Error completing CA setup', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to configure workspace";
            setToast({ message: errorMessage, type: "error" });
            setStep(2); // Revert step on failure
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
            <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />

            {/* Header for Onboarding Steps */}
            {step > 0 && step < 3 && (
                <div className="absolute top-0 left-0 w-full bg-white border-b border-slate-200 z-50 flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-[#0A2C4B]" />
                        <span className="text-xl font-bold font-display tracking-tight text-[#0A2C4B]">VyaparOS</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">CA Dashboard Setup</span>
                    </div>
                </div>
            )}

            {/* Background design */}
            <div className="absolute top-0 left-0 w-full h-96 bg-[#0A2C4B] -skew-y-3 origin-top-left -z-10 mt-16"></div>

            <div className="w-full max-w-[720px] mx-auto z-10 transition-all duration-500">

                {step === 0 && (
                    <div className="bg-white rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-200 p-8 sm:p-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="mx-auto w-20 h-20 bg-[#D98205]/10 rounded-full flex items-center justify-center mb-8 border-4 border-white shadow-lg">
                            <Shield className="w-10 h-10 text-[#D98205]" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-[#05172A] mb-4 font-display tracking-tight">
                            Welcome to Your <br />Compliance Control Room.
                        </h1>
                        <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-sm mx-auto">
                            Centralize your practice, monitor client risk, and automate tracking in one structured environment.
                        </p>
                        <Button
                            onClick={() => setStep(1)}
                            className="bg-[#0A2C4B] hover:bg-[#05172A] text-white py-4 px-8 rounded-xl text-lg w-full shadow-xl shadow-[#0A2C4B]/20 transition-all flex justify-center items-center"
                            rightIcon={<ArrowRight className="w-5 h-5" />}
                        >
                            Configure Your Firm
                        </Button>
                    </div>
                )}

                {step > 0 && step < 3 && (
                    <>
                        <div className="text-center mb-6 text-white">
                            <h2 className="text-3xl font-bold font-display tracking-tight">
                                {step === 1 ? 'Firm Settings' : 'Build Your Team'}
                            </h2>
                        </div>

                        <div className="bg-white rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                            {/* Step Indicator */}
                            <div className="w-full bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                                <span className="text-sm font-semibold text-slate-700">Step {step} of 2</span>
                                <div className="flex gap-2">
                                    <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#D98205] shadow-sm shadow-[#D98205]/30' : 'bg-slate-200'}`}></div>
                                    <div className={`h-2 w-16 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#D98205] shadow-sm shadow-[#D98205]/30' : 'bg-slate-200'}`}></div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">

                                {/* Step 1: Firm Setup */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <Input
                                            id="firm_name"
                                            name="firm_name"
                                            label={<span>Firm Name / Practice Name <span className="text-[#D98205]">*</span></span>}
                                            placeholder="e.g. A. Singh & Associates"
                                            value={formData.firm_name}
                                            onChange={handleChange}
                                            icon={<Briefcase className="w-5 h-5 text-slate-400" />}
                                            required
                                        />

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Estimated Number of Clients
                                            </label>
                                            <select
                                                name="client_count"
                                                value={formData.client_count}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2C4B] transition-colors cursor-pointer"
                                            >
                                                <option value="1-50">1 - 50 Clients</option>
                                                <option value="51-200">51 - 200 Clients</option>
                                                <option value="201-500">201 - 500 Clients</option>
                                                <option value="500+">500+ Clients</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Primary Portfoloio Composition
                                            </label>
                                            <select
                                                name="firm_filing_preference"
                                                value={formData.firm_filing_preference}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#0A2C4B] transition-colors cursor-pointer"
                                            >
                                                <option value="mixed">Mixed (Monthly & QRMP)</option>
                                                <option value="monthly">Mostly Monthly Returns</option>
                                                <option value="qrmp">Mostly QRMP</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Build Your Team */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 flex items-start gap-4">
                                            <div className="bg-[#D98205]/10 p-2 rounded-lg text-[#D98205] shrink-0 mt-0.5">
                                                <Users className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">Invite your Staff & Articles.</h4>
                                                <p className="text-xs text-slate-500 mt-1">They will receive an email to set up their accounts. You can configure their access later.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {formData.teamMembers.map((member, index) => (
                                                <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-[#D98205]">*</span></label>
                                                            <input
                                                                type="text"
                                                                value={member.name}
                                                                onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                                                                placeholder="e.g. John Doe"
                                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-600 mb-1">Email <span className="text-[#D98205]">*</span></label>
                                                            <input
                                                                type="email"
                                                                value={member.email}
                                                                onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                                                                placeholder="john@example.com"
                                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 flex items-center justify-between">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 rounded border-slate-300 text-[#0A2C4B] focus:ring-[#0A2C4B]"
                                                                checked={member.canOnboardClients}
                                                                onChange={(e) => handleTeamMemberChange(index, 'canOnboardClients', e.target.checked)}
                                                            />
                                                            <span className="text-sm text-slate-700">Allow this team to onboard clients (Staff Role)</span>
                                                        </label>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveTeamMember(index)}
                                                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded bg-red-50"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleAddTeamMember}
                                                className="w-full border-dashed border-2 py-3 text-slate-600 hover:text-[#0A2C4B] hover:border-[#0A2C4B] hover:bg-slate-50"
                                                icon={<UserPlus className="w-4 h-4" />}
                                            >
                                                Add Another Team Member
                                            </Button>
                                        </div>
                                    </div>
                                )}



                                {/* Navigation */}
                                <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
                                    <Button
                                        type="button"
                                        variant="unstyled"
                                        onClick={() => setStep(step - 1)}
                                        className="text-slate-500 hover:text-[#0A2C4B] font-medium px-4 py-2 rounded-xl transition-colors hover:bg-slate-100"
                                    >
                                        Back
                                    </Button>

                                    <div className="flex gap-3 items-center">
                                        {step === 2 && (
                                            <Button
                                                type="button"
                                                variant="unstyled"
                                                onClick={handleSkipTeam}
                                                className="text-slate-500 hover:text-slate-700 font-medium px-4 py-2 rounded-xl transition-colors"
                                            >
                                                Skip for now
                                            </Button>
                                        )}

                                            <Button
                                                type="button"
                                                variant="unstyled"
                                                onClick={handleNext}
                                                isLoading={step === 2 && loading}
                                                className="bg-[#D98205] hover:bg-[#B46A04] text-white px-8 py-2.5 rounded-xl transition-all shadow-md shadow-[#D98205]/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center font-medium"
                                                rightIcon={step === 2 ? <Rocket className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                            >
                                                {step === 2 ? 'Activate Workspace' : 'Continue'}
                                            </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Step 3: Activation Confirmation loader */}
                {step === 3 && (
                    <div className="bg-white rounded-[16px] shadow-xl shadow-slate-200/50 border border-slate-200 p-10 sm:p-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-sm mx-auto">
                        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
                            {/* Inner Circle Base */}
                            <div className="absolute inset-0 bg-[#0A2C4B]/5 rounded-full"></div>

                            {/* SVG Spinner overriding to deep navy */}
                            <svg className="animate-spin absolute inset-0 w-full h-full text-[#0A2C4B]/20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                                <path className="opacity-75" fill="#0A2C4B" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>

                            <Shield className="w-8 h-8 text-[#0A2C4B] relative z-10" />
                        </div>

                        <h3 className="text-xl font-bold text-[#05172A] mb-4">Initializing Environment</h3>

                        <div className="space-y-4 text-left border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-[#D98205] flex-shrink-0 animate-in fade-in duration-500 delay-100" />
                                <span className="text-sm font-medium text-slate-700">Firm profile saved</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-[#D98205] flex-shrink-0 animate-in fade-in duration-500 delay-300" />
                                <span className="text-sm font-medium text-slate-700">Team settings configured</span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-6 animate-pulse">
                            Redirecting to dashboard...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CAOnboarding;
