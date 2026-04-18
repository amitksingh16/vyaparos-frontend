import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { revealUp } from './motion';

void motion;

const CTASection = () => {
    return (
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,_#0f172a_0%,_#172554_45%,_#312e81_100%)] py-24 text-center sm:py-28">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:60px_60px] opacity-25" />
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

            <motion.div
                {...revealUp}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
            >
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-100 backdrop-blur-xl">
                    <Sparkles className="h-3.5 w-3.5" />
                    Ready to Upgrade the Workflow
                </div>

                <h2 className="mt-7 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                    Give your firm a calmer, sharper operating layer.
                </h2>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                    Bring deadlines, documents, and team execution into one premium control room built for modern CA firms.
                </p>

                <div className="mt-10 inline-block">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Link
                            to="/signup?role=ca"
                            className="cta-primary-glow relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-fuchsia-500 px-8 py-4 text-base font-semibold text-white shadow-[0_20px_60px_-20px_rgba(99,102,241,0.95)] transition-all duration-300"
                        >
                            <span className="absolute -inset-2 rounded-[1.4rem] bg-gradient-to-r from-blue-500/30 via-indigo-500/35 to-fuchsia-500/30 blur-xl" />
                            <span className="relative z-10 flex items-center gap-2">
                                Start Free Workspace
                                <ArrowRight className="h-5 w-5" />
                            </span>
                        </Link>
                    </motion.div>
                </div>

                <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    No setup friction. Start clean. Scale with confidence.
                </p>
            </motion.div>
        </section>
    );
};

export default CTASection;
