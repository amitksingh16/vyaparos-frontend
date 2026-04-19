import React from 'react';

const sizeMap = {
    sm: {
        spinner: 'h-5 w-5',
        dots: 'h-1.5 w-1.5',
        button: 'h-4 w-4',
        text: 'text-xs',
        gap: 'gap-1',
    },
    md: {
        spinner: 'h-8 w-8',
        dots: 'h-2 w-2',
        button: 'h-4 w-4',
        text: 'text-sm',
        gap: 'gap-1.5',
    },
    lg: {
        spinner: 'h-12 w-12',
        dots: 'h-2.5 w-2.5',
        button: 'h-5 w-5',
        text: 'text-base',
        gap: 'gap-2',
    },
};

const Spinner = ({ size = 'md', className = '', innerClassName = 'bg-white/90' }) => {
    const config = sizeMap[size] || sizeMap.md;

    return (
        <div
            className={`relative inline-flex ${config.spinner} items-center justify-center ${className}`}
            role="status"
            aria-busy="true"
        >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-30 blur-md" />
            <div className="relative h-full w-full animate-spin rounded-full bg-[conic-gradient(from_90deg,#3b82f6_0deg,#6366f1_38%,#a855f7_68%,rgba(226,232,240,0.18)_82%,rgba(226,232,240,0.06)_100%)] p-[2px] [animation-duration:1s]">
                <div className={`h-full w-full rounded-full ${innerClassName}`} />
            </div>
            <span className="sr-only">Loading</span>
        </div>
    );
};

const Dots = ({ size = 'md' }) => {
    const config = sizeMap[size] || sizeMap.md;

    return (
        <div
            className={`inline-flex items-center ${config.gap}`}
            role="status"
            aria-busy="true"
        >
            {[0, 1, 2].map((index) => (
                <span
                    key={index}
                    className={`${config.dots} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-90 animate-bounce [animation-duration:1s]`}
                    style={{ animationDelay: `${index * 0.16}s` }}
                />
            ))}
            <span className="sr-only">Loading</span>
        </div>
    );
};

const ButtonLoader = ({ size = 'md', text }) => {
    const config = sizeMap[size] || sizeMap.md;

    return (
        <span
            className={`inline-flex items-center justify-center gap-2 ${config.text}`}
            role="status"
            aria-busy="true"
        >
            <span className={`relative inline-flex ${config.button} items-center justify-center`}>
                <span className="absolute inset-0 rounded-full border border-white/25" />
                <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white border-r-white/80 [animation-duration:.9s]" />
                <span className="absolute inset-[3px] rounded-full bg-white/10" />
            </span>
            {text ? <span>{text}</span> : null}
            <span className="sr-only">Loading</span>
        </span>
    );
};

const FullscreenLoader = ({ size = 'lg', text = 'Loading your workspace...' }) => {
    const config = sizeMap[size] || sizeMap.lg;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6 backdrop-blur-sm"
            role="status"
            aria-busy="true"
            aria-live="polite"
        >
            <div className="flex min-w-[18rem] max-w-sm flex-col items-center gap-4 rounded-3xl border border-white/30 bg-white/75 px-8 py-7 text-center shadow-[0_30px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
                <Spinner size={size} innerClassName="bg-white/80" />
                <div className={`font-medium text-slate-700 ${config.text}`}>{text}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    VyaparOS
                </div>
            </div>
        </div>
    );
};

const Loader = ({ type = 'spinner', size = 'md', text }) => {
    if (type === 'dots') {
        return <Dots size={size} />;
    }

    if (type === 'fullscreen') {
        return <FullscreenLoader size={size} text={text} />;
    }

    if (type === 'button') {
        return <ButtonLoader size={size} text={text} />;
    }

    return <Spinner size={size} />;
};

export default Loader;
