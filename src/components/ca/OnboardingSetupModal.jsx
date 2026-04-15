import React, { useState, useEffect, createElement } from 'react';
import axios from 'axios';
import { Check, ChevronRight, ChevronLeft, Sparkles, UserPlus, Users, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StepCard = ({
    stepNumber,
    title,
    description,
    icon,
    children,
}) => {
    return (
        <div className="flex flex-col rounded-3xl border border-[#0A2C4B]/20 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.9))] shadow-[0_24px_48px_-32px_rgba(10,44,75,0.45)] p-6 sm:p-8 transition-all duration-300 w-full">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#0A2C4B] text-white shadow-md flex-shrink-0">
                        {createElement(icon, { className: 'h-6 w-6' })}
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Step {stepNumber}
                        </div>
                        <h3 className="mt-1 text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
                        <p className="mt-1 sm:mt-2 text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                </div>
            </div>
            <div className="mt-6 flex-grow flex flex-col">
                {children}
            </div>
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
    if (!isOpen) return null;

    const [activeStep, setActiveStep] = useState(currentStep || 1);
    
    // Sync active step if prop changes (optional but good practice)
    useEffect(() => {
        if (currentStep && currentStep > activeStep) {
            setActiveStep(currentStep);
        }
    }, [currentStep]);

    const activePercent = Math.round((activeStep / 3) * 100);

    // Step 1 State
    const [firmData, setFirmData] = useState({ name: '', size: '', portfolio: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 2 State
    const [teamInviteData, setTeamInviteData] = useState({ name: '', email: '', role: 'ca_staff' });
    const [isInviting, setIsInviting] = useState(false);

    // Step 3 State
    const [clientData, setClientData] = useState({ business_name: '', filing_type: 'GST & IT' });

    const handleFirmSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('/api/ca/setup', firmData);
            if (onSetupFirm) onSetupFirm(firmData);
            setActiveStep(2);
        } catch (error) {
            console.error('Failed to setup firm', error);
            // Move to next step anyway for local demo UX if API fails in local
            setActiveStep(2);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            await axios.post('/api/ca/team/invite', teamInviteData);
            if (onInviteTeam) onInviteTeam(teamInviteData);
            setActiveStep(3);
        } catch (error) {
            console.error('Failed to invite team', error);
            setActiveStep(3);
        } finally {
            setIsInviting(false);
        }
    };

    const handleClientSubmit = (e) => {
        e.preventDefault();
        if (onAddClient) onAddClient(clientData);
        else if (onClose) onClose();
    };
    
    // UI Helpers
    const PrimaryButton = ({ label, onClick, disabled, loading, isSubmit = false }) => (
        <button
            type={isSubmit ? "submit" : "button"}
            onClick={!isSubmit ? onClick : undefined}
            disabled={disabled || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0A2C4B]/15 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)] disabled:cursor-not-allowed disabled:opacity-70"
        >
            {loading ? 'Processing...' : label}
            {!loading && <ChevronRight className="h-4 w-4" />}
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.55)]">
                <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.16),transparent_36%)]" />
                <div className="relative p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                Guided Setup
                            </div>
                            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                                Welcome to VyaparOS <span className="inline-block">👋</span>
                            </h2>
                            <p className="mt-2 text-base text-slate-500">
                                Let&apos;s set up your workspace in 3 quick steps
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
                        >
                            I&apos;ll do this later
                        </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 max-w-xl mx-auto">
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            <span>Setup Progress</span>
                            <span>{activePercent}% complete</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#0A2C4B,#0F5C4A)] transition-all duration-300 ease-in-out"
                                style={{ width: `${activePercent}%` }}
                            />
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-600">
                            Step {activeStep} of 3
                        </p>
                    </div>

                    <div className="mt-8 relative max-w-xl mx-auto flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {activeStep === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="w-full"
                                >
                                    <StepCard
                                        stepNumber={1}
                                        title="Setup your firm"
                                        description="Add your firm details to personalize your workspace"
                                        icon={Building2}
                                    >
                                        <form onSubmit={handleFirmSubmit} className="flex flex-col gap-4 mt-2">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Firm Name / Practice Name</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                    value={firmData.name}
                                                    onChange={(e) => setFirmData({...firmData, name: e.target.value})}
                                                    placeholder="e.g. Sharma & Associates"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Client Est.</label>
                                                    <select 
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                        value={firmData.size}
                                                        onChange={(e) => setFirmData({...firmData, size: e.target.value})}
                                                    >
                                                        <option value="">Select size...</option>
                                                        <option value="1-50">1-50</option>
                                                        <option value="51-200">51-200</option>
                                                        <option value="200+">200+</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">Portfolio</label>
                                                    <select 
                                                        required
                                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                        value={firmData.portfolio}
                                                        onChange={(e) => setFirmData({...firmData, portfolio: e.target.value})}
                                                    >
                                                        <option value="">Select composition...</option>
                                                        <option value="Mixed">Mixed</option>
                                                        <option value="Only GST">Only GST</option>
                                                        <option value="Only IT Returns">Only IT</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4">
                                                <PrimaryButton 
                                                    isSubmit 
                                                    label="Save Firm Details" 
                                                    loading={isSubmitting} 
                                                />
                                            </div>
                                        </form>
                                    </StepCard>
                                </motion.div>
                            )}
                            
                            {activeStep === 2 && (
                                <motion.div
                                    key="step2"
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
                                        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4 mt-2">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Staff Name</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    placeholder="e.g. Rahul Sharma"
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                    value={teamInviteData.name}
                                                    onChange={(e) => setTeamInviteData({...teamInviteData, name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Staff Email</label>
                                                <input 
                                                    required 
                                                    type="email" 
                                                    placeholder="rahul@example.com"
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                    value={teamInviteData.email}
                                                    onChange={(e) => setTeamInviteData({...teamInviteData, email: e.target.value})}
                                                />
                                            </div>
                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                                <BackButton onClick={() => setActiveStep(1)} />
                                                <div className="flex items-center gap-2">
                                                    <SkipButton onClick={() => setActiveStep(3)} />
                                                    <PrimaryButton 
                                                        isSubmit 
                                                        label="Send Invite & Next" 
                                                        loading={isInviting} 
                                                    />
                                                </div>
                                            </div>
                                        </form>
                                    </StepCard>
                                </motion.div>
                            )}

                            {activeStep === 3 && (
                                <motion.div
                                    key="step3"
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
                                        <form onSubmit={handleClientSubmit} className="flex flex-col gap-4 mt-2">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Business Name</label>
                                                <input 
                                                    required 
                                                    type="text" 
                                                    placeholder="e.g. Acme Corp"
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                    value={clientData.business_name}
                                                    onChange={(e) => setClientData({...clientData, business_name: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Filing Type</label>
                                                <select 
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#0A2C4B] focus:outline-none focus:ring-2 focus:ring-[#0A2C4B]/20"
                                                    value={clientData.filing_type}
                                                    onChange={(e) => setClientData({...clientData, filing_type: e.target.value})}
                                                >
                                                    <option>GST & IT</option>
                                                    <option>GST Only</option>
                                                    <option>IT Only</option>
                                                </select>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                                                <BackButton onClick={() => setActiveStep(2)} />
                                                <PrimaryButton 
                                                    isSubmit 
                                                    label="Finish Setup" 
                                                />
                                            </div>
                                        </form>
                                    </StepCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingSetupModal;
