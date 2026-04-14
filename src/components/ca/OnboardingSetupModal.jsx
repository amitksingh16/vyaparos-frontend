import { createElement } from 'react';
import { Check, ChevronRight, Sparkles, UserPlus, Users } from 'lucide-react';

const StepCard = ({
    stepNumber,
    title,
    description,
    actionLabel,
    onAction,
    icon,
    isActive,
    isComplete,
    isDisabled = false,
    progressLabel,
}) => {
    return (
        <div
            className={`rounded-3xl border p-5 transition-all duration-200 ease-in-out ${
                isActive
                    ? 'border-[#0A2C4B]/20 bg-[linear-gradient(180deg,rgba(255,255,255,1),rgba(239,246,255,0.9))] shadow-[0_24px_48px_-32px_rgba(10,44,75,0.45)]'
                    : 'border-slate-200 bg-white/90'
            } ${isDisabled ? 'border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.95),rgba(255,255,255,0.98))] shadow-[0_18px_40px_-34px_rgba(245,158,11,0.4)] ring-1 ring-amber-100' : 'hover:-translate-y-1 hover:shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]'}`}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            isComplete
                                ? 'bg-emerald-100 text-emerald-700'
                                : isActive
                                    ? 'bg-[#0A2C4B] text-white'
                                    : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                        {isComplete ? <Check className="h-5 w-5" /> : createElement(icon, { className: 'h-5 w-5' })}
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                            Step {stepNumber}
                        </div>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">{title}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
                        {progressLabel && (
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                {progressLabel}
                            </p>
                        )}
                    </div>
                </div>
                <div
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
                        isComplete
                            ? 'bg-emerald-100 text-emerald-700'
                            : isActive
                                ? 'bg-blue-100 text-[#0A2C4B]'
                                : 'bg-slate-100 text-slate-500'
                    }`}
                >
                    {isComplete ? 'Done' : isActive ? 'Next' : 'Queued'}
                </div>
            </div>

            <button
                onClick={onAction}
                disabled={isDisabled}
                className={`mt-5 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out ${
                    isDisabled
                        ? 'cursor-not-allowed border border-amber-200 bg-white text-amber-700 shadow-sm'
                        : isActive
                            ? 'bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] text-white shadow-lg shadow-[#0A2C4B]/15 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)]'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
                {actionLabel}
                {!isDisabled && <ChevronRight className="h-4 w-4" />}
            </button>
        </div>
    );
};

const OnboardingSetupModal = ({
    isOpen,
    currentStep,
    percentComplete,
    completedSteps,
    totalSteps,
    onInviteTeam,
    onAddClient,
    onClose,
}) => {
    if (!isOpen) return null;

    const stepOneComplete = currentStep > 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.55)]">
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
                                Let&apos;s set up your workspace in 2 quick steps
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-full px-3 py-2 text-sm font-medium text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-800"
                        >
                            I&apos;ll do this later
                        </button>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4">
                        <div className="flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            <span>Setup Progress</span>
                            <span>{percentComplete}% complete</span>
                        </div>
                        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full rounded-full bg-[linear-gradient(90deg,#0A2C4B,#0F5C4A)] transition-all duration-300 ease-in-out"
                                style={{ width: `${percentComplete}%` }}
                            />
                        </div>
                        <p className="mt-3 text-sm font-medium text-slate-600">
                            {completedSteps} of {totalSteps} setup steps complete
                        </p>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <StepCard
                            stepNumber={1}
                            title="Invite your team"
                            description="Add your staff so they can manage clients and filings"
                            actionLabel="Invite Team"
                            onAction={onInviteTeam}
                            icon={UserPlus}
                            isActive={currentStep === 1}
                            isComplete={stepOneComplete}
                            progressLabel={stepOneComplete ? 'Completed' : 'Required to unlock Step 2'}
                        />
                        <StepCard
                            stepNumber={2}
                            title="Add your first client"
                            description="Start tracking compliance for your clients"
                            actionLabel="Add Client"
                            onAction={onAddClient}
                            icon={Users}
                            isActive={currentStep === 2}
                            isComplete={false}
                            isDisabled={currentStep < 2}
                            progressLabel={currentStep < 2 ? 'Complete Step 1 to unlock this step 🔓' : 'Now active'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingSetupModal;
