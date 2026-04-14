import { createElement } from 'react';

const EmptyStateCard = ({
    icon,
    title,
    description,
    helperText,
    actionLabel,
    onAction,
    animateIcon = false,
    className = '',
}) => {
    return (
        <div className={`mx-auto flex max-w-md flex-col items-center rounded-3xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.92))] px-6 py-10 text-center shadow-[0_24px_60px_-36px_rgba(15,23,42,0.45)] transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.38)] ${className}`}>
            <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(15,92,74,0.12),rgba(10,44,75,0.18))] text-[#0A2C4B] shadow-sm ${animateIcon ? 'animate-pulse' : ''}`}>
                {createElement(icon, { className: 'h-8 w-8' })}
            </div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            {helperText && <p className="mt-2 text-xs font-medium leading-5 text-slate-400">{helperText}</p>}
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0A2C4B,#0F5C4A)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0A2C4B]/15 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_-18px_rgba(10,44,75,0.65)]"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyStateCard;
