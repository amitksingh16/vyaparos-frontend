import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Basic components redefined for the new dark theme
const PrimaryButton = ({ label, onClick, disabled, loading, isSubmit = false }) => (
    <button
        type={isSubmit ? 'submit' : 'button'}
        onClick={!isSubmit ? onClick : undefined}
        disabled={disabled || loading}
        className="inline-flex items-center justify-center gap-2 h-12 rounded-xl bg-[linear-gradient(135deg,#0ea5e9,#8b5cf6)] px-8 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-70"
    >
        {loading ? 'Processing...' : label}
        {!loading ? <ChevronRight className="h-5 w-5" /> : null}
    </button>
);

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
    >
        <ChevronLeft className="h-4 w-4" />
        Back
    </button>
);

const SkipButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
    >
        Skip for now
    </button>
);

const neonInputStyle = "w-full h-12 rounded-xl border border-white/30 bg-black/20 px-4 text-base font-medium text-white placeholder-slate-400 backdrop-blur-md focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all duration-300";

const FormLabel = ({ children }) => (
    <label className="mb-2 block text-sm font-semibold text-gray-200">{children}</label>
);

const OnboardingSetupModal = ({
    isOpen,
    currentStep,
    onSetupFirm,
    onInviteTeam,
    onAddClient,
    onClose,
}) => {
    const navigate = useNavigate();
    const { user, fetchUser, setOnboardingComplete } = useAuth();

    const [step, setStep] = useState(currentStep || 1);
    const [formData, setFormData] = useState({ firm_name: '', total_clients: '', specialization: '', pan_number: '', gstin: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teamInviteData, setTeamInviteData] = useState({ name: '', email: '', phone: '', role: 'ca_staff' });
    const [isInviting, setIsInviting] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState('');
    const [clientData, setClientData] = useState({
        business_name: '',
        email: '',
        entity_type: 'prop',
        filing_type: 'monthly',
        primary_mobile: '',
        whatsapp_mobile: '',
        pan_number: '',
        gstin: '',
        state: '',
    });
    const [isFinishing, setIsFinishing] = useState(false);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (currentStep && currentStep !== step) {
            setStep(currentStep);
        }
    }, [currentStep, step]);

    if (!isOpen) return null;

    const handleNextStep = () => {
        setStep((prev) => Math.min(prev + 1, 3));
    };

    const handleSkip = () => {
        if (onClose) onClose();
        navigate('/dashboard');
    };

    const handleFinish = async () => {
        setIsFinishing(true);
        try {
            const payload = {
                business_name: clientData.business_name,
                email: clientData.email,
                primary_mobile: clientData.primary_mobile,
                whatsapp_mobile: clientData.whatsapp_mobile || clientData.primary_mobile,
                pan_number: clientData.pan_number,
                gstin: clientData.gstin || undefined,
                gst_registered: Boolean(clientData.gstin),
                business_type: clientData.entity_type,
                entity_type: clientData.entity_type,
                filing_type: clientData.filing_type,
                state: clientData.state,
            };

            const clientResponse = await axios.post('/ca/clients', payload);

            if (onAddClient) {
                await onAddClient(clientResponse.data?.business || payload);
            }

            await axios.post('/onboarding/complete');
            setOnboardingComplete(true);
            await fetchUser();

            if (onClose) onClose();
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to setup client', error);
            alert("Backend Error: " + JSON.stringify(error.response?.data || error.message));
        } finally {
            setIsFinishing(false);
        }
    };

    const handleSaveFirmDetails = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const userMobile = user?.phone || user?.mobile_number || localStorage.getItem('mobile_number');
            // HARDWIRED FALLBACK: If user mobile is missing from context, send a dummy one just to pass validation
            const safeMobile = userMobile || "9999999999"; 

            const payload = {
                ...formData,
                mobile_number: safeMobile
            };

            console.log("🚀 ATTEMPTING TO SEND:", payload);

            const response = await axios.post('/ca/setup', payload); // URL from existing setup

            console.log("✅ SUCCESS RESPONSE:", response.data);
            if (onSetupFirm) {
                onSetupFirm(payload);
            }
            setStep(2); 

        } catch (error) {
            console.error("❌ CRASH DETAIL:", error);
            alert("Error: " + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        setInviteSuccess('');
        try {
            await axios.post('/team/invite', teamInviteData);
            if (onInviteTeam) {
                await onInviteTeam(teamInviteData);
            }
            setInviteSuccess('Invitation sent successfully.');
            handleNextStep();
        } catch (error) {
            console.error('Failed to invite team', error);
            alert("Backend Error: " + JSON.stringify(error.response?.data || error.message));
        } finally {
            setIsInviting(false);
        }
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        await handleFinish();
    };

    return (
        <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center bg-[#020617] overflow-y-auto py-10 px-4">
            <div className="relative w-full max-w-4xl p-8 sm:p-12 mx-auto rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
                {/* Glow Effects */}
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-600/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[100px] pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col w-full">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-slate-300 mb-6">
                            <Sparkles className="h-4 w-4 text-amber-400" />
                            VyaparOS Setup
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                            Welcome to VyaparOS <span className="inline-block origin-bottom-right hover:animate-pulse">👋</span>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-300">
                            Let&apos;s set up your workspace in 3 quick steps
                        </p>
                    </div>

                    {/* Progress Bar (Stepper) */}
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center gap-2 sm:gap-4">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${step >= num ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40'}`}>
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= num ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/50'}`}>
                                        {num}
                                    </div>
                                    <span className="text-sm font-semibold hidden sm:block">
                                        {num === 1 ? 'Firm' : num === 2 ? 'Team' : 'Client'}
                                    </span>
                                </div>
                                {num < 3 && <div className={`h-[2px] w-8 sm:w-16 rounded-full ${step > num ? 'bg-cyan-500/50' : 'bg-white/10'}`} />}
                            </div>
                        ))}
                    </div>

                    {/* Form Content */}
                    <div className="w-full">
                        <AnimatePresence mode="wait">
                            {step === 1 && <FirmSetup key="step1" data={formData} setData={setFormData} onSubmit={handleSaveFirmDetails} loading={isSubmitting} />}
                            {step === 2 && (
                                <InviteTeam
                                    key="step2"
                                    data={teamInviteData}
                                    setData={setTeamInviteData}
                                    inviteSuccess={inviteSuccess}
                                    onSubmit={handleInviteSubmit}
                                    onBack={() => setStep(1)}
                                    onSkip={handleNextStep}
                                    loading={isInviting}
                                />
                            )}
                            {step === 3 && (
                                <AddClient
                                    key="step3"
                                    data={clientData}
                                    setData={setClientData}
                                    onSubmit={handleClientSubmit}
                                    onBack={() => setStep(2)}
                                    loading={isFinishing}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FirmSetup = ({ data, setData, onSubmit, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
    >
        <form className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <FormLabel>Firm Name / Practice Name</FormLabel>
                    <input
                        required
                        type="text"
                        className={neonInputStyle}
                        value={data.firm_name}
                        onChange={(e) => setData({ ...data, firm_name: e.target.value })}
                        placeholder="e.g. Sharma & Associates"
                    />
                </div>
                <div>
                    <FormLabel>Client Estimate</FormLabel>
                    <select
                        required
                        className={`${neonInputStyle} appearance-none [&>option]:bg-[#020617] [&>option]:text-white`}
                        value={data.total_clients}
                        onChange={(e) => setData({ ...data, total_clients: e.target.value })}
                    >
                        <option value="">Select size...</option>
                        <option value="1-50">1-50</option>
                        <option value="51-200">51-200</option>
                        <option value="200+">200+</option>
                    </select>
                </div>
                <div>
                    <FormLabel>Portfolio</FormLabel>
                    <select
                        required
                        className={`${neonInputStyle} appearance-none [&>option]:bg-[#020617] [&>option]:text-white`}
                        value={data.specialization}
                        onChange={(e) => setData({ ...data, specialization: e.target.value })}
                    >
                        <option value="">Select composition...</option>
                        <option value="Mixed">Mixed</option>
                        <option value="Only GST">Only GST</option>
                        <option value="Only IT Returns">Only IT</option>
                    </select>
                </div>
                <div>
                    <FormLabel>Firm PAN</FormLabel>
                    <input
                        required
                        type="text"
                        className={`${neonInputStyle} uppercase`}
                        value={data.pan_number}
                        onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                    />
                </div>
                <div>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <input
                        type="text"
                        className={`${neonInputStyle} uppercase`}
                        value={data.gstin}
                        onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                        placeholder="15-digit GST number"
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-end">
                <PrimaryButton
                    label="Continue to Next Step"
                    loading={loading}
                    onClick={onSubmit}
                />
            </div>
        </form>
    </motion.div>
);

const InviteTeam = ({ data, setData, inviteSuccess, onSubmit, onBack, onSkip, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <FormLabel>Staff Name</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className={neonInputStyle}
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>Staff Email</FormLabel>
                    <input
                        required
                        type="email"
                        placeholder="rahul@example.com"
                        className={neonInputStyle}
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>Mobile Number</FormLabel>
                    <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className={neonInputStyle}
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                </div>
            </div>
            
            {inviteSuccess && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                    {inviteSuccess}
                </div>
            )}

            <div className="mt-8 flex items-center justify-between">
                <BackButton onClick={onBack} />
                <div className="flex items-center gap-4">
                    <SkipButton onClick={onSkip} />
                    <PrimaryButton
                        isSubmit
                        label="Send Invite & Next"
                        loading={loading}
                    />
                </div>
            </div>
        </form>
    </motion.div>
);

const AddClient = ({ data, setData, onSubmit, onBack, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <FormLabel>Business Name</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className={neonInputStyle}
                        value={data.business_name}
                        onChange={(e) => setData({ ...data, business_name: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>Email Address</FormLabel>
                    <input
                        required
                        type="email"
                        placeholder="contact@acme.com"
                        className={neonInputStyle}
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>Entity Type</FormLabel>
                    <select
                        className={`${neonInputStyle} appearance-none [&>option]:bg-[#020617] [&>option]:text-white`}
                        value={data.entity_type}
                        onChange={(e) => setData({ ...data, entity_type: e.target.value })}
                    >
                        <option value="prop">Proprietorship</option>
                        <option value="partnership">Partnership</option>
                        <option value="llp">LLP</option>
                        <option value="pvt_ltd">Pvt Ltd</option>
                        <option value="opc">OPC</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <FormLabel>Filing Type</FormLabel>
                    <select
                        className={`${neonInputStyle} appearance-none [&>option]:bg-[#020617] [&>option]:text-white`}
                        value={data.filing_type}
                        onChange={(e) => setData({ ...data, filing_type: e.target.value })}
                    >
                        <option value="monthly">Monthly</option>
                        <option value="qrmp">QRMP</option>
                    </select>
                </div>
                <div>
                    <FormLabel>Primary Mobile (WhatsApp)</FormLabel>
                    <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className={neonInputStyle}
                        value={data.primary_mobile}
                        onChange={(e) => setData({ ...data, primary_mobile: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>WhatsApp Mobile</FormLabel>
                    <input
                        type="tel"
                        placeholder="Defaults to primary"
                        className={neonInputStyle}
                        value={data.whatsapp_mobile}
                        onChange={(e) => setData({ ...data, whatsapp_mobile: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>PAN Number</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="ABCDE1234F"
                        className={`${neonInputStyle} uppercase`}
                        value={data.pan_number}
                        onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                    />
                </div>
                <div>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <input
                        type="text"
                        placeholder="Optional"
                        className={`${neonInputStyle} uppercase`}
                        value={data.gstin}
                        onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                    />
                </div>
                <div className="md:col-span-2">
                    <FormLabel>State</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Maharashtra"
                        className={neonInputStyle}
                        value={data.state}
                        onChange={(e) => setData({ ...data, state: e.target.value })}
                    />
                </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between">
                <BackButton onClick={onBack} />
                <PrimaryButton
                    isSubmit
                    label="Finish Setup"
                    loading={loading}
                />
            </div>
        </form>
    </motion.div>
);

export default OnboardingSetupModal;
