const OnboardingProgressBanner = ({
    completedSteps,
    totalSteps,
    percentComplete,
    onContinue,
}) => {
    return (
        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.88))] shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
            <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                        Complete your setup: {completedSteps} of {totalSteps} steps done
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        Finish onboarding to unlock a smoother client and team workflow from day one.
                    </p>
                    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80">
                        <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#0A2C4B,#0F5C4A)] transition-all duration-300 ease-in-out"
                            style={{ width: `${percentComplete}%` }}
                        />
                    </div>
                </div>

                <button
                    onClick={onContinue}
                    className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0A2C4B]/15 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)]"
                >
                    Continue Setup
                </button>
            </div>
        </div>
    );
};

export default OnboardingProgressBanner;
