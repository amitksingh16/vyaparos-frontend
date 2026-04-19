import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Sparkles } from 'lucide-react';
import { staggerContainer, staggerItem } from '../landing/motion';

const AuthSplitLayout = ({
    panelBadge,
    panelTitle,
    panelDescription,
    panelHighlights,
    formEyebrow,
    formTitle,
    formDescription,
    children,
    footer,
}) => {
    return (
        <div className="relative h-full overflow-hidden font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.2),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(129,140,248,0.24),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_55%,_#ffffff_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40" />
            <div className="absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-blue-400/14 blur-3xl" />
            <div className="absolute right-[-10rem] bottom-[-8rem] h-96 w-96 rounded-full bg-fuchsia-400/10 blur-3xl" />

            <div className="relative flex h-full overflow-hidden">
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative hidden h-full w-1/2 overflow-hidden border-r border-white/30 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_28%),radial-gradient(circle_at_78%_20%,_rgba(168,85,247,0.18),_transparent_24%),linear-gradient(160deg,_#08152b_0%,_#0f172a_35%,_#172554_100%)] px-8 py-8 text-white lg:flex lg:flex-col lg:justify-center xl:px-12 [@media_(max-height:1100px)]:px-7 [@media_(max-height:1100px)]:py-6"
                >
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{ y: [0, -12, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute left-[12%] top-[22%] h-3 w-3 rounded-full bg-blue-300/80 shadow-[0_0_24px_rgba(147,197,253,0.8)]"
                        />
                        <motion.div
                            animate={{ y: [0, 14, 0] }}
                            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute right-[18%] top-[30%] h-2.5 w-2.5 rounded-full bg-fuchsia-300/80 shadow-[0_0_22px_rgba(232,121,249,0.7)]"
                        />
                        <motion.div
                            animate={{ x: [0, 10, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute bottom-[20%] left-[24%] h-2 w-2 rounded-full bg-cyan-300/80 shadow-[0_0_20px_rgba(103,232,249,0.75)]"
                        />
                    </div>

                    <div className="relative z-10 flex h-full w-full flex-col justify-center overflow-hidden py-4 [@media_(max-height:1100px)]:py-2">
                        <div className="w-full max-w-lg">
                            <motion.div variants={staggerItem} className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl">
                                    <Shield className="h-6 w-6 text-amber-300" />
                                </div>
                                <div>
                                    <div className="font-display text-2xl font-bold tracking-tight">VyaparOS</div>
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
                                        Compliance OS
                                    </div>
                                </div>
                            </motion.div>

                            <div className="overflow-hidden pt-8 [@media_(max-height:1100px)]:pt-6">
                                <motion.div
                                    variants={staggerItem}
                                    className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200 backdrop-blur-xl [@media_(max-height:1100px)]:mb-4"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-blue-300" />
                                    {panelBadge}
                                </motion.div>

                                <motion.h1 variants={staggerItem} className="text-5xl font-black leading-[0.98] tracking-[-0.05em] text-white xl:text-6xl [@media_(max-height:1100px)]:text-[3.25rem] [@media_(max-height:950px)]:text-4xl [@media_(max-height:850px)]:text-[3rem]">
                                    {panelTitle}
                                </motion.h1>
                                <motion.p variants={staggerItem} className="mt-5 max-w-[92%] text-lg leading-8 text-slate-300 [@media_(max-height:1100px)]:mt-4 [@media_(max-height:1100px)]:text-[15px] [@media_(max-height:1100px)]:leading-6">
                                    {panelDescription}
                                </motion.p>

                                <motion.div variants={staggerItem} className="mt-8 space-y-3 [@media_(max-height:1100px)]:mt-6 [@media_(max-height:1100px)]:space-y-2.5">
                                    {panelHighlights.map(({ icon: Icon, title, description }) => (
                                        <motion.div
                                            key={title}
                                            whileHover={{ x: 4 }}
                                            className="rounded-[1.6rem] border border-white/12 bg-white/8 px-4 py-3 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.95)] backdrop-blur-2xl [@media_(max-height:1100px)]:px-4 [@media_(max-height:1100px)]:py-2.5"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/10">
                                                    <Icon className="h-5 w-5 text-blue-200" />
                                                </div>
                                                <div>
                                                    <div className="text-base font-semibold text-white [@media_(max-height:1100px)]:text-[15px]">{title}</div>
                                                    <div className="mt-1 text-sm leading-6 text-slate-300 [@media_(max-height:1100px)]:leading-5">{description}</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="flex h-full w-full items-center justify-center overflow-hidden px-4 py-3 sm:px-6 lg:w-1/2 lg:justify-end lg:px-8 lg:py-6 [@media_(max-height:1100px)]:py-4"
                >
                    <div className="w-full max-w-[38rem] overflow-hidden lg:ml-auto">
                        <div className="rounded-[2rem] border border-white/70 bg-white/82 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-6 [@media_(max-height:1100px)]:p-5">
                            <div className="mb-5 flex items-center justify-between gap-4 [@media_(max-height:1100px)]:mb-4">
                                <div className="flex items-center gap-3 lg:hidden">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#9333ea)] text-white shadow-lg shadow-blue-200/70">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-display text-xl font-bold text-slate-950">VyaparOS</div>
                                        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                                            Compliance OS
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-flex rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                                    {formEyebrow}
                                </div>
                            </div>

                            <div className="mb-5 [@media_(max-height:1100px)]:mb-4">
                                <h2 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-[2.65rem] [@media_(max-height:1100px)]:text-[2.25rem]">
                                    {formTitle}
                                </h2>
                                <p className="mt-2 max-w-xl text-base leading-7 text-slate-600 [@media_(max-height:1100px)]:text-[15px] [@media_(max-height:1100px)]:leading-6">
                                    {formDescription}
                                </p>
                            </div>

                            {children}

                            {footer ? (
                                <div className="mt-4 border-t border-slate-200/70 pt-4 [@media_(max-height:1100px)]:mt-3 [@media_(max-height:1100px)]:pt-3">
                                    {footer}
                                </div>
                            ) : null}

                            <div className="mt-3 lg:hidden">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-blue-700"
                                >
                                    Back to home
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

export default AuthSplitLayout;
