const ambientOrbs = [
    { top: '-8%', left: '8%', size: '19rem', delay: '0s', duration: '24s', color: 'rgba(59,130,246,0.34)' },
    { top: '58%', left: '-6%', size: '22rem', delay: '-7s', duration: '28s', color: 'rgba(147,51,234,0.26)' },
    { top: '18%', left: '74%', size: '20rem', delay: '-4s', duration: '26s', color: 'rgba(34,211,238,0.25)' },
    { top: '72%', left: '66%', size: '18rem', delay: '-10s', duration: '30s', color: 'rgba(236,72,153,0.2)' },
];

const particles = [
    { top: '12%', left: '24%', delay: '0s', size: '0.45rem', color: 'rgba(125,211,252,0.82)', glow: 'rgba(34,211,238,0.72)' },
    { top: '20%', left: '58%', delay: '-3s', size: '0.42rem', color: 'rgba(147,197,253,0.8)', glow: 'rgba(59,130,246,0.72)' },
    { top: '33%', left: '13%', delay: '-6s', size: '0.42rem', color: 'rgba(196,181,253,0.74)', glow: 'rgba(139,92,246,0.68)' },
    { top: '43%', left: '88%', delay: '-1s', size: '0.5rem', color: 'rgba(244,114,182,0.72)', glow: 'rgba(236,72,153,0.68)' },
    { top: '60%', left: '31%', delay: '-8s', size: '0.4rem', color: 'rgba(103,232,249,0.78)', glow: 'rgba(6,182,212,0.68)' },
    { top: '71%', left: '76%', delay: '-5s', size: '0.44rem', color: 'rgba(165,180,252,0.74)', glow: 'rgba(99,102,241,0.68)' },
    { top: '84%', left: '18%', delay: '-10s', size: '0.38rem', color: 'rgba(216,180,254,0.72)', glow: 'rgba(168,85,247,0.64)' },
    { top: '10%', left: '90%', delay: '-12s', size: '0.4rem', color: 'rgba(186,230,253,0.76)', glow: 'rgba(14,165,233,0.66)' },
    { top: '52%', left: '54%', delay: '-14s', size: '0.38rem', color: 'rgba(251,207,232,0.74)', glow: 'rgba(244,114,182,0.62)' },
    { top: '28%', left: '42%', delay: '-9s', size: '0.3rem', color: 'rgba(191,219,254,0.72)', glow: 'rgba(96,165,250,0.62)' },
    { top: '76%', left: '47%', delay: '-16s', size: '0.36rem', color: 'rgba(221,214,254,0.72)', glow: 'rgba(124,58,237,0.62)' },
    { top: '64%', left: '91%', delay: '-18s', size: '0.34rem', color: 'rgba(103,232,249,0.68)', glow: 'rgba(34,211,238,0.6)' },
    { top: '38%', left: '67%', delay: '-4s', size: '0.55rem', color: 'rgba(125,211,252,0.7)', glow: 'rgba(34,211,238,0.56)' },
    { top: '88%', left: '62%', delay: '-11s', size: '0.48rem', color: 'rgba(244,114,182,0.66)', glow: 'rgba(236,72,153,0.54)' },
    { top: '16%', left: '38%', delay: '-15s', size: '0.36rem', color: 'rgba(196,181,253,0.68)', glow: 'rgba(139,92,246,0.54)' },
];

const AuthAmbientBackground = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <style>
                {`
                @keyframes auth-orb-drift {
                    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.62; }
                    35% { transform: translate3d(18px, -20px, 0) scale(1.04); opacity: 0.78; }
                    70% { transform: translate3d(-16px, 18px, 0) scale(0.98); opacity: 0.66; }
                }

                @keyframes auth-particle-drift {
                    0%, 100% { transform: translate3d(0, 0, 0); opacity: 0.3; }
                    45% { transform: translate3d(12px, -18px, 0); opacity: 0.74; }
                    75% { transform: translate3d(-8px, 10px, 0); opacity: 0.46; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .auth-orb, .auth-particle {
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
                    className="auth-particle absolute rounded-full blur-[0.5px]"
                    style={{
                        top: particle.top,
                        left: particle.left,
                        width: particle.size,
                        height: particle.size,
                        background: particle.color,
                        boxShadow: `0 0 16px ${particle.glow}, 0 0 34px ${particle.glow}`,
                        animation: 'auth-particle-drift 13s ease-in-out infinite',
                        animationDelay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
};

export default AuthAmbientBackground;
