import React, { useEffect, useState, createElement } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, UserPlus, Users, Building2, Smartphone, CreditCard, Hash } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StepCard = ({
    stepNumber,
    title,
    description,
    icon,
    children,
}) => {
    return (
        <div className="flex w-full flex-col rounded-3xl border border-[#0A2C4B]/20 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.9))] p-5 shadow-[0_24px_48px_-32px_rgba(10,44,75,0.45)] transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#0A2C4B] text-white shadow-md sm:h-12 sm:w-12">
                        {createElement(icon, { className: 'h-5 w-5' })}
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Step {stepNumber}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex flex-grow flex-col">
                {children}
            </div>
        </div>
    );
};

const PrimaryButton = ({ label, onClick, disabled, loading, isSubmit = false }) => (
    <button
        type={isSubmit ? 'submit' : 'button'}
        onClick={!isSubmit ? onClick : undefined}
        disabled={disabled || loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#0A2C4B]/15 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)] disabled:cursor-not-allowed disabled:opacity-70"
    >
        {loading ? 'Processing...' : label}
        {!loading ? <ChevronRight className="h-4 w-4" /> : null}
    </button>
);

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
    >
        <ChevronLeft className="h-4 w-4" />
        Back
    </button>
);

const SkipButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-slate-700"
    >
        Skip
    </button>
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
        if (!isOpen) {
            return undefined;
        }

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
        } finally {
            setIsFinishing(false);
        }
    };

    const activePercent = Math.round((step / 3) * 100);

    const handleSaveFirmDetails = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = {
                firm_name: formData.firm_name,
                total_clients: formData.total_clients,
                specialization: formData.specialization,
                pan_number: formData.pan_number ? formData.pan_number.toUpperCase() : '',
                gstin: formData.gstin ? formData.gstin.toUpperCase() : '',
                mobile_number: user?.phone || user?.mobile_number || ''
            };
            await axios.post('/ca/setup', payload);
            if (onSetupFirm) {
                onSetupFirm(payload);
            }
            // Trigger state change only on successful POST
            handleNextStep();
        } catch (error) {
            console.error('Failed to setup firm', error);
            // Removed handleNextStep() to prevent proceeding on 400 Bad Request
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
        } finally {
            setIsInviting(false);
        }
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        await handleFinish();
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-white/30 backdrop-blur-lg" />

            <div className="relative flex h-full items-center justify-center px-4 py-4 sm:px-6">
                <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out">
                    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pr-[6px]">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                    <Sparkles className="h-3 w-3 text-amber-500" />
                                    Guided Setup
                                </div>
                                <h2 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-slate-950">
                                    Welcome to VyaparOS <span className="inline-block">{'👋'}</span>
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Let&apos;s set up your workspace in 3 quick steps
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleSkip}
                                className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
                            >
                                I&apos;ll do this later
                            </button>
                        </div>

                        <div className="mx-auto mt-4 w-full max-w-xl rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                            <div className="flex items-center justify-between gap-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                                <span>Setup Progress</span>
                                <span>{activePercent}% COMPLETED</span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#0A2C4B,#0F5C4A)] transition-all duration-300 ease-in-out"
                                    style={{ width: `${activePercent}%` }}
                                />
                            </div>
                        </div>

                        <div className="relative mb-2 mt-5 w-full">
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
        </div>
    );
};

const neonInputStyle = "w-full rounded-2xl border border-white/20 bg-white/5 pl-10 pr-4 py-3 text-sm font-medium text-white placeholder-slate-400 backdrop-blur-md shadow-[0_8px_30px_rgba(255,255,255,0.05)] hover:border-white/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all duration-300";

const FirmSetup = ({ data, setData, onSubmit, loading }) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full flex flex-col min-h-fit max-h-[90vh] overflow-y-auto rounded-3xl border border-[#0a192f]/50 bg-[#0a192f]/95 backdrop-blur-xl p-6 shadow-[0_20px_50px_rgba(10,25,47,0.5)]"
    >
        <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20">
                <Building2 className="h-6 w-6" />
            </div>
            <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">Step 1</div>
                <h3 className="text-xl font-bold text-white mt-1">Setup your firm</h3>
                <p className="mt-1 text-sm text-slate-300">Add your firm details to personalize your workspace</p>
            </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Firm Name / Practice Name</label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        required
                        type="text"
                        className={neonInputStyle}
                        value={data.firm_name}
                        onChange={(e) => setData({ ...data, firm_name: e.target.value })}
                        placeholder="e.g. Sharma & Associates"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">Client Est.</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            required
                            className={`${neonInputStyle} appearance-none [&>option]:bg-[#0a192f] [&>option]:text-white`}
                            value={data.total_clients}
                            onChange={(e) => setData({ ...data, total_clients: e.target.value })}
                        >
                            <option value="">Select size...</option>
                            <option value="1-50">1-50</option>
                            <option value="51-200">51-200</option>
                            <option value="200+">200+</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">Portfolio</label>
                    <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <select
                            required
                            className={`${neonInputStyle} appearance-none [&>option]:bg-[#0a192f] [&>option]:text-white`}
                            value={data.specialization}
                            onChange={(e) => setData({ ...data, specialization: e.target.value })}
                        >
                            <option value="">Select composition...</option>
                            <option value="Mixed">Mixed</option>
                            <option value="Only GST">Only GST</option>
                            <option value="Only IT Returns">Only IT</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">Firm PAN</label>
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            required
                            type="text"
                            className={`${neonInputStyle} uppercase`}
                            value={data.pan_number}
                            onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                            placeholder="ABCDE1234F"
                        />
                    </div>
                </div>
                <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-300">GSTIN</label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            required
                            type="text"
                            className={`${neonInputStyle} uppercase`}
                            value={data.gstin}
                            onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                            placeholder="15-digit GST number"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-5">
                <PrimaryButton
                    isSubmit
                    label="Save Firm Details"
                    loading={loading}
                />
            </div>
        </form>
    </motion.div>
);

const InviteTeam = ({
    data,
    setData,
    inviteSuccess,
    onSubmit,
    onBack,
    onSkip,
    loading,
}) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full"
    >
        <StepCard
            stepNumber={2}
            title="Invite your team"
            description="Add your staff so they can manage clients and track filings."
            icon={UserPlus}
        >
            <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-4">
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Staff Name</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                        value={data.name}
                        onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Staff Email</label>
                    <input
                        required
                        type="email"
                        placeholder="rahul@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                </div>
                <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Mobile Number</label>
                    <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                        value={data.phone}
                        onChange={(e) => setData({ ...data, phone: e.target.value })}
                    />
                </div>
                {inviteSuccess ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                        {inviteSuccess}
                    </div>
                ) : null}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <BackButton onClick={onBack} />
                    <div className="flex items-center gap-2">
                        <SkipButton onClick={onSkip} />
                        <PrimaryButton
                            isSubmit
                            label="Send Invites & Next"
                            loading={loading}
                        />
                    </div>
                </div>
            </form>
        </StepCard>
    </motion.div>
);

const AddClient = ({
    data,
    setData,
    onSubmit,
    onBack,
    loading,
}) => (
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="w-full"
    >
        <StepCard
            stepNumber={3}
            title="Add your first client"
            description="Start tracking compliance for your clients."
            icon={Users}
        >
            <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Name</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Acme Corp"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.business_name}
                            onChange={(e) => setData({ ...data, business_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label>
                        <input
                            required
                            type="email"
                            placeholder="contact@acme.com"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Entity Type</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
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
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Filing Type</label>
                        <select
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.filing_type}
                            onChange={(e) => setData({ ...data, filing_type: e.target.value })}
                        >
                            <option value="monthly">Monthly</option>
                            <option value="qrmp">QRMP</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Primary Mobile (WhatsApp)</label>
                        <input
                            required
                            type="tel"
                            placeholder="e.g. 9876543210"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.primary_mobile}
                            onChange={(e) => setData({ ...data, primary_mobile: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">WhatsApp Mobile</label>
                        <input
                            type="tel"
                            placeholder="Defaults to primary mobile"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.whatsapp_mobile}
                            onChange={(e) => setData({ ...data, whatsapp_mobile: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">PAN Number</label>
                        <input
                            required
                            type="text"
                            placeholder="ABCDE1234F"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium uppercase focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.pan_number}
                            onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">GSTIN</label>
                        <input
                            type="text"
                            placeholder="Optional"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium uppercase focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.gstin}
                            onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">State</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Maharashtra"
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]"
                            value={data.state}
                            onChange={(e) => setData({ ...data, state: e.target.value })}
                        />
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <BackButton onClick={onBack} />
                    <PrimaryButton
                        isSubmit
                        label="Finish Setup"
                        loading={loading}
                    />
                </div>
            </form>
        </StepCard>
    </motion.div>
);

export default OnboardingSetupModal;
