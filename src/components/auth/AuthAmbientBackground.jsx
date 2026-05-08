const ambientOrbs = [
    { top: '-8%', left: '8%', size: '19rem', delay: '0s', duration: '19s', color: 'rgba(59,130,246,0.36)' },
    { top: '58%', left: '-6%', size: '22rem', delay: '-7s', duration: '23s', color: 'rgba(147,51,234,0.28)' },
    { top: '18%', left: '74%', size: '20rem', delay: '-4s', duration: '21s', color: 'rgba(34,211,238,0.26)' },
    { top: '72%', left: '66%', size: '18rem', delay: '-10s', duration: '25s', color: 'rgba(99,102,241,0.3)' },
];

const particles = [
    { top: '14%', left: '26%', delay: '0s' },
    { top: '22%', left: '62%', delay: '-3s' },
    { top: '38%', left: '14%', delay: '-6s' },
    { top: '48%', left: '88%', delay: '-1s' },
    { top: '66%', left: '34%', delay: '-8s' },
    { top: '78%', left: '78%', delay: '-5s' },
    { top: '86%', left: '18%', delay: '-10s' },
    { top: '10%', left: '90%', delay: '-12s' },
];

const AuthAmbientBackground = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <style>
                {`
                @keyframes auth-orb-drift {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.62; }
                    35% { transform: translate3d(28px, -34px, 0) scale(1.08); opacity: 0.82; }
                    70% { transform: translate3d(-22px, 24px, 0) scale(0.96); opacity: 0.68; }
                }

                @keyframes auth-particle-drift {
                    0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.16; }
                    45% { transform: translate3d(14px, -22px, 0); opacity: 0.5; }
                    75% { transform: translate3d(-8px, 10px, 0); opacity: 0.3; }
                }

                @keyframes auth-soft-rise {
                    from { transform: translate3d(0, 12px, 0); opacity: 0; }
                    to { transform: translate3d(0, 0, 0); opacity: 1; }
                }

                @keyframes auth-card-float {
                    0%, 100% { transform: translate3d(0, 0, 0); }
                    50% { transform: translate3d(0, -5px, 0); }
                }

                @media (prefers-reduced-motion: reduce) {
                    .auth-orb, .auth-particle, .auth-page-enter, .auth-card-float {
                        animation: none !important;
                    }
                }
                `}
            </style>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(168,85,247,0.16),transparent_26%),linear-gradient(135deg,#0a192f_0%,#0b1530_48%,#111827_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px] opacity-25" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_38%)] opacity-70" />

            {ambientOrbs.map((orb, index) => (
                <div
                    key={index}
                    className="auth-orb absolute rounded-full blur-3xl mix-blend-screen"
                    style={{
                        top: orb.top,
                        left: orb.left,
                        width: orb.size,
                        height: orb.size,
                        background: orb.color,
                        animation: `auth-orb-drift ${orb.duration} ease-in-out infinite`,
                        animationDelay: orb.delay,
                    }}
                />
            ))}

            {particles.map((particle, index) => (
                <div
                    key={index}
                    className="auth-particle absolute h-1.5 w-1.5 rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(125,211,252,0.85)]"
                    style={{
                        top: particle.top,
                        left: particle.left,
                        animation: 'auth-particle-drift 13s ease-in-out infinite',
                        animationDelay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
};

export default AuthAmbientBackground;
