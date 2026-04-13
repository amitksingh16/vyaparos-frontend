import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, BellRing, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { revealUp, staggerContainer, staggerItem } from './motion';

void motion;

const features = [
    {
        icon: LayoutDashboard,
        title: 'Unified Portfolio View',
        description: 'Track clients, assignments, and compliance status in one streamlined operating layer.',
        accent: 'from-blue-500/15 to-indigo-500/10',
    },
    {
        icon: Activity,
        title: 'Real-Time Health Signals',
        description: 'Spot emerging risk faster with deadline prioritization, status visibility, and client pulse metrics.',
        accent: 'from-fuchsia-500/15 to-indigo-500/10',
    },
    {
        icon: BellRing,
        title: 'Follow-Up Precision',
        description: 'Move from scattered reminders to organized action lanes for every filing and document request.',
        accent: 'from-sky-500/15 to-cyan-500/10',
    },
    {
        icon: ShieldCheck,
        title: 'Structured Audit Trail',
        description: 'Keep uploads, ownership, and status changes visible so nothing slips between team members.',
        accent: 'from-indigo-500/15 to-violet-500/10',
    },
];

const FeaturesSection = () => {
    return (
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-24 sm:py-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.12),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.1),_transparent_24%)]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    {...revealUp}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                        Product Capabilities
                    </div>
                    <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                        A cleaner control system for compliance-heavy firms
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        Every section is designed to feel calm, legible, and operationally sharp, so your team can
                        move from chaos to confident execution.
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            variants={staggerItem}
                            whileHover={{ y: -10, scale: 1.01 }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                            className="group relative overflow-hidden rounded-[1.8rem] border border-slate-200/70 bg-white/80 p-7 shadow-[0_20px_50px_-26px_rgba(15,23,42,0.28)] backdrop-blur-xl"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <div className="rounded-2xl border border-white/80 bg-white/85 p-3 shadow-md shadow-blue-100/60">
                                        <feature.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <ArrowUpRight className="h-5 w-5 text-slate-300 transition-colors duration-300 group-hover:text-slate-500" />
                                </div>

                                <h3 className="mt-7 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                                    {feature.title}
                                </h3>
                                <p className="mt-4 text-base leading-7 text-slate-600">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;
