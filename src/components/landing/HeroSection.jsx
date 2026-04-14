import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BellRing, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { staggerContainer, staggerItem } from './motion';

void motion;

const heroHighlights = [
    {
        title: 'Multi-client portfolio tracking',
        description: 'Manage all your clients and compliance workflows from a single unified dashboard.',
    },
    {
        title: 'Real-time deadline visibility',
        description: 'Stay ahead of filings with clear, prioritized deadline tracking across all entities.',
    },
    {
        title: 'Automated follow-ups',
        description: 'Reduce manual effort with structured reminders and task workflows.',
    },
];

const dashboardRows = [
    { name: 'Acme Retail LLP', health: 94, due: 'GSTR-3B in 2 days', tone: 'emerald' },
    { name: 'Saffron Foods', health: 72, due: 'TDS filing this week', tone: 'amber' },
    { name: 'Northstar Exports', health: 48, due: 'GST overdue review', tone: 'rose' },
];

const toneClasses = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
};

const HeroSection = () => {
    return (
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.2),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(129,140,248,0.24),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_55%,_#ffffff_100%)] pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-40 lg:pb-28">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
            <div className="absolute left-1/2 top-0 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative mx-auto grid max-w-7xl gap-14 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:px-8">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl"
                >
                    <motion.div
                        variants={staggerItem}
                        className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-600 shadow-lg shadow-blue-100/60 backdrop-blur-xl"
                    >
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        Built for Structured CA Operations
                    </motion.div>

                    <motion.h1
                        variants={staggerItem}
                        className="max-w-4xl text-5xl font-black tracking-[-0.05em] text-slate-950 sm:text-6xl lg:text-7xl"
                    >
                        The{' '}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
                            Digital Brain
                        </span>{' '}
                        for Modern CA Firms
                    </motion.h1>

                    <motion.p
                        variants={staggerItem}
                        className="mt-7 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl"
                    >
                        Replace fragmented follow-ups with one polished workspace for compliance visibility,
                        document control, and team coordination across every client you manage.
                    </motion.p>

                    <motion.div
                        variants={staggerItem}
                        className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center"
                    >
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/signup?role=ca"
                                className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 px-7 py-4 text-base font-semibold text-white shadow-[0_18px_60px_-18px_rgba(79,70,229,0.85)] transition-all duration-300"
                            >
                                <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Free Workspace
                                    <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                            </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-6 py-4 text-base font-semibold text-slate-700 shadow-lg shadow-slate-200/40 backdrop-blur transition-colors duration-300 hover:border-slate-300 hover:bg-white"
                            >
                                Sign In
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={staggerItem}
                        className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"
                    >
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                            Audit-ready document trails
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                            <BellRing className="h-4 w-4 text-indigo-500" />
                            Deadline visibility across portfolios
                        </div>
                        <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            Clean setup for firms of any size
                        </div>
                    </motion.div>

                    <motion.div
                        variants={staggerItem}
                        className="mt-12 grid gap-4 sm:grid-cols-3"
                    >
                        {heroHighlights.map((highlight) => (
                            <div
                                key={highlight.title}
                                className="rounded-3xl border border-white/70 bg-white/70 p-5 shadow-xl shadow-blue-100/40 backdrop-blur-xl"
                            >
                                <div className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">
                                    {highlight.title}
                                </div>
                                <div className="mt-2 text-sm font-medium leading-6 text-slate-500">
                                    {highlight.description}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
                    className="relative"
                >
                    <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative mx-auto max-w-2xl"
                    >
                        <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-blue-400/20 blur-3xl" />
                        <div className="absolute -right-5 bottom-8 h-36 w-36 rounded-full bg-fuchsia-400/20 blur-3xl" />

                        <div className="rounded-[2rem] border border-white/70 bg-white/70 p-3 shadow-[0_30px_90px_-30px_rgba(51,65,85,0.4)] backdrop-blur-2xl">
                            <div className="overflow-hidden rounded-[1.55rem] border border-slate-200/80 bg-slate-950 shadow-2xl">
                                <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/95 px-5 py-4 text-slate-300">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full bg-rose-400" />
                                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                                        <span className="h-3 w-3 rounded-full bg-emerald-400" />
                                    </div>
                                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                                        VyaparOS Control Room
                                    </div>
                                </div>

                                <div className="grid gap-5 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,0.96),_rgba(2,6,23,1))] p-5 sm:p-6">
                                    <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                                        <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                        Portfolio Health
                                                    </p>
                                                    <p className="mt-3 text-4xl font-black tracking-[-0.05em] text-white">
                                                        86%
                                                    </p>
                                                </div>
                                                <div className="rounded-2xl bg-emerald-400/12 px-3 py-2 text-xs font-semibold text-emerald-300">
                                                    12 filings completed today
                                                </div>
                                            </div>
                                            <div className="mt-6 h-2 rounded-full bg-white/10">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: '86%' }}
                                                    transition={{ duration: 1.1, delay: 0.4 }}
                                                    className="h-2 rounded-full bg-gradient-to-r from-blue-400 via-indigo-400 to-fuchsia-400"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4">
                                            <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                                                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                    Urgent Tasks
                                                </div>
                                                <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">07</div>
                                                <div className="mt-2 text-sm text-slate-400">Needing follow-up this week</div>
                                            </div>
                                            <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                                                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                    Team Capacity
                                                </div>
                                                <div className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">91%</div>
                                                <div className="mt-2 text-sm text-slate-400">Assignments balanced across staff</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                                                    Client Pulse
                                                </div>
                                                <div className="mt-2 text-lg font-semibold text-white">
                                                    Live visibility into every filing lane
                                                </div>
                                            </div>
                                            <div className="rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold text-blue-200">
                                                24 monitored entities
                                            </div>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            {dashboardRows.map((row, index) => (
                                                <motion.div
                                                    key={row.name}
                                                    initial={{ opacity: 0, x: 24 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.45, delay: 0.35 + (index * 0.12) }}
                                                    className="grid grid-cols-[1.35fr_0.55fr_0.9fr] items-center gap-3 rounded-2xl border border-white/8 bg-slate-900/55 px-4 py-3"
                                                >
                                                    <div>
                                                        <div className="text-sm font-semibold text-white">{row.name}</div>
                                                        <div className="mt-1 text-xs text-slate-400">{row.due}</div>
                                                    </div>
                                                    <div className="text-sm font-semibold text-slate-200">{row.health}%</div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2.5 w-2.5 rounded-full ${toneClasses[row.tone]}`} />
                                                        <div className="h-2 flex-1 rounded-full bg-white/10">
                                                            <div
                                                                className={`h-2 rounded-full ${toneClasses[row.tone]}`}
                                                                style={{ width: `${row.health}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
