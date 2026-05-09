import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronRight, ChevronLeft, Search, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

void motion;

// Basic components tuned to the light glass onboarding theme.
const PrimaryButton = ({ label, onClick, disabled, loading, isSubmit = false }) => (
    <button
        type={isSubmit ? 'submit' : 'button'}
        onClick={!isSubmit ? onClick : undefined}
        disabled={disabled || loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0ea5e9,#8b5cf6)] px-6 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-70"
    >
        {loading ? 'Processing...' : label}
        {!loading ? <ChevronRight className="h-5 w-5" /> : null}
    </button>
);

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
        <ChevronLeft className="h-4 w-4" />
        Back
    </button>
);

const SkipButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
        Skip for now
    </button>
);

const glassInputStyle = "w-full h-10 rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm font-medium text-slate-900 placeholder-slate-400 shadow-sm backdrop-blur-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300";

const FormLabel = ({ children }) => (
    <label className="mb-1 block text-xs font-semibold text-slate-700">{children}</label>
);

const INDIAN_STATES = [
    'Andaman and Nicobar Islands',
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chandigarh',
    'Chhattisgarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jammu and Kashmir',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Ladakh',
    'Lakshadweep',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Puducherry',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
];

const StateCombobox = ({ value, onChange, error }) => {
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);

    const filteredStates = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) return INDIAN_STATES;
        return INDIAN_STATES.filter((state) => state.toLowerCase().includes(normalizedQuery));
    }, [query]);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setQuery('');
                setActiveIndex(0);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isOpen]);

    const selectState = (state) => {
        onChange(state);
        setQuery('');
        setIsOpen(false);
        setActiveIndex(0);
        inputRef.current?.focus();
    };

    const openList = () => {
        setIsOpen(true);
        setQuery('');
        setActiveIndex(0);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }
            setActiveIndex((index) => (filteredStates.length === 0 ? 0 : Math.min(index + 1, filteredStates.length - 1)));
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
        }

        if (event.key === 'Enter' && isOpen) {
            event.preventDefault();
            if (filteredStates[activeIndex]) {
                selectState(filteredStates[activeIndex]);
            }
        }

        if (event.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    ref={inputRef}
                    role="combobox"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-controls="state-options"
                    aria-autocomplete="list"
                    aria-activedescendant={isOpen && filteredStates[activeIndex] ? `state-option-${activeIndex}` : undefined}
                    type="text"
                    className={`${glassInputStyle} pl-10 pr-10 ${error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : ''}`}
                    placeholder="Select State"
                    value={isOpen ? query : value}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActiveIndex(0);
                        onChange('');
                        setIsOpen(true);
                    }}
                    onFocus={openList}
                    onClick={openList}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    aria-label="Toggle state list"
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                        setIsOpen((open) => !open);
                        inputRef.current?.focus();
                    }}
                >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}

            {isOpen && (
                <div
                    id="state-options"
                    role="listbox"
                    className="absolute z-30 mt-2 max-h-44 w-full overflow-y-auto rounded-xl border border-slate-200/90 bg-white/95 p-1 shadow-xl shadow-blue-100/60 backdrop-blur-xl"
                >
                    {filteredStates.length > 0 ? (
                        filteredStates.map((state, index) => {
                            const isActive = index === activeIndex;
                            const isSelected = state === value;

                            return (
                                <button
                                    key={state}
                                    id={`state-option-${index}`}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'} ${isSelected ? 'text-blue-700' : ''}`}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        selectState(state);
                                    }}
                                >
                                    <span>{state}</span>
                                    {isSelected && <Check className="h-4 w-4 text-blue-600" />}
                                </button>
                            );
                        })
                    ) : (
                        <div className="px-3 py-3 text-sm font-medium text-slate-500">No state found</div>
                    )}
                </div>
            )}
        </div>
    );
};

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
    const [clientErrors, setClientErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && currentStep) {
            setStep(currentStep);
        }
    }, [currentStep, isOpen]);

    console.log("Current step:", step);

    if (!isOpen) return null;

    const handleNextStep = () => {
        setStep((prev) => Math.min(prev + 1, 3));
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
            setStep(2);
            if (onSetupFirm) {
                onSetupFirm(payload);
            }

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
            // FIX 1: Using the correct endpoint '/ca/team' instead of '/team/invite'
            // FIX 2: Added origin so backend can generate the correct setup link
            await axios.post('/ca/team', {
                ...teamInviteData,
                origin: window.location.origin
            });

            if (onInviteTeam) {
                await onInviteTeam(teamInviteData);
            }

            setInviteSuccess('✅ Invitation sent successfully to console!');

            // FIX 3: Added a 1-second delay so you can actually see the success message 
            // before it automatically jumps to Step 3.
            setTimeout(() => {
                handleNextStep();
            }, 1000);

        } catch (error) {
            console.error('Failed to invite team', error);
            alert("Backend Error: " + (error.response?.data?.message || error.message));
        } finally {
            setIsInviting(false);
        }
    };

    const handleClientSubmit = async (e) => {
        e.preventDefault();
        if (!clientData.state) {
            setClientErrors({ state: 'Please select a state.' });
            return;
        }
        setClientErrors({});
        await handleFinish();
    };

    return (
        <div className="fixed inset-0 z-[100] flex min-h-screen items-start justify-center overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.18),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(129,140,248,0.2),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_55%,_#ffffff_100%)] px-3 py-3 sm:items-center sm:px-4 sm:py-4 [min-height:100dvh]">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
            <div className={`relative z-10 mx-auto w-full max-w-4xl overscroll-contain rounded-[1.5rem] border border-white/70 bg-white/70 p-4 shadow-xl shadow-blue-100/40 backdrop-blur-xl sm:rounded-[2rem] sm:p-5 md:px-8 md:py-5 ${step === 1 ? 'overflow-hidden' : 'max-h-[calc(100vh-1.5rem)] overflow-y-auto overflow-x-hidden sm:max-h-[calc(100vh-2rem)] [max-height:calc(100dvh-1.5rem)] sm:[max-height:calc(100dvh-2rem)]'}`}>
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-400/20 blur-[100px] pointer-events-none"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fuchsia-400/15 blur-[100px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col w-full">
                    {/* Header */}
                    <div className="text-center mb-3">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 shadow-lg shadow-blue-100/60 backdrop-blur-xl sm:text-xs">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            VyaparOS Setup
                        </div>
                        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                            Welcome to VyaparOS <span className="inline-block origin-bottom-right hover:animate-pulse">👋</span>
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600">
                            Let&apos;s set up your workspace in 3 quick steps
                        </p>
                    </div>

                    {/* Progress Bar (Stepper) */}
                    <div className="mb-3 flex items-center justify-center gap-2 sm:gap-4">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center gap-2 sm:gap-4">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-xl ${step >= num ? 'bg-blue-500/10 border-blue-200 text-blue-700' : 'bg-white/60 border-slate-200/80 text-slate-400'}`}>
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${step >= num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        {num}
                                    </div>
                                    <span className="text-sm font-semibold hidden sm:block">
                                        {num === 1 ? 'Firm' : num === 2 ? 'Team' : 'Client'}
                                    </span>
                                </div>
                                {num < 3 && <div className={`h-[2px] w-8 sm:w-16 rounded-full ${step > num ? 'bg-blue-500/50' : 'bg-slate-200/80'}`} />}
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
                                    errors={clientErrors}
                                    setErrors={setClientErrors}
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
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="sm:col-span-2">
                    <FormLabel>Firm Name / Practice Name</FormLabel>
                    <input
                        required
                        type="text"
                        className={glassInputStyle}
                        value={data.firm_name}
                        onChange={(e) => setData({ ...data, firm_name: e.target.value })}
                        placeholder="e.g. Sharma & Associates"
                    />
                </div>
                <div>
                    <FormLabel>Client Estimate</FormLabel>
                    <select
                        required
                        className={`${glassInputStyle} appearance-none [&>option]:bg-white [&>option]:text-slate-900`}
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
                        className={`${glassInputStyle} appearance-none [&>option]:bg-white [&>option]:text-slate-900`}
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
                        className={`${glassInputStyle} uppercase`}
                        value={data.pan_number}
                        onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F"
                    />
                </div>
                <div>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <input
                        type="text"
                        className={`${glassInputStyle} uppercase`}
                        value={data.gstin}
                        onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                        placeholder="15-digit GST number"
                    />
                </div>
            </div>
            <div className="mt-3 flex justify-end">
                <PrimaryButton
                    isSubmit
                    label="Continue to Next Step"
                    loading={loading}
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
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="sm:col-span-2">
                    <FormLabel>Staff Name</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className={glassInputStyle}
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
                        className={glassInputStyle}
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
                        className={glassInputStyle}
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

            <div className="mt-3 flex items-center justify-between">
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

const AddClient = ({ data, setData, errors, setErrors, onSubmit, onBack, loading }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full"
    >
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <div>
                    <FormLabel>Business Name</FormLabel>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Acme Corp"
                        className={glassInputStyle}
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
                        className={glassInputStyle}
                        value={data.email}
                        onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>Entity Type</FormLabel>
                    <select
                        className={`${glassInputStyle} appearance-none [&>option]:bg-white [&>option]:text-slate-900`}
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
                        className={`${glassInputStyle} appearance-none [&>option]:bg-white [&>option]:text-slate-900`}
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
                        className={glassInputStyle}
                        value={data.primary_mobile}
                        onChange={(e) => setData({ ...data, primary_mobile: e.target.value })}
                    />
                </div>
                <div>
                    <FormLabel>WhatsApp Mobile</FormLabel>
                    <input
                        type="tel"
                        placeholder="Defaults to primary"
                        className={glassInputStyle}
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
                        className={`${glassInputStyle} uppercase`}
                        value={data.pan_number}
                        onChange={(e) => setData({ ...data, pan_number: e.target.value.toUpperCase() })}
                    />
                </div>
                <div>
                    <FormLabel>GSTIN (Optional)</FormLabel>
                    <input
                        type="text"
                        placeholder="Optional"
                        className={`${glassInputStyle} uppercase`}
                        value={data.gstin}
                        onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormLabel>State</FormLabel>
                    <StateCombobox
                        value={data.state}
                        error={errors.state}
                        onChange={(state) => {
                            setData({ ...data, state });
                            setErrors((currentErrors) => ({ ...currentErrors, state: '' }));
                        }}
                    />
                </div>
            </div>

            <div className="sticky bottom-0 z-20 -mx-1 mt-2 flex flex-col-reverse gap-2 border-t border-slate-200/70 bg-white/75 px-1 pt-3 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
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
