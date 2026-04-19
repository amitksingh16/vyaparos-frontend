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
        <div className="relative h-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans">
            <div className="relative flex h-full overflow-hidden">
                <motion.section
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative hidden h-full w-1/2 overflow-hidden border-r border-white/30 bg-[linear-gradient(160deg,_#08152b_0%,_#0f172a_35%,_#172554_100%)] px-12 py-8 text-white lg:flex lg:flex-col lg:justify-center [@media_(max-height:1100px)]:py-6"
                >
                    <div className="relative z-10 flex h-full w-full flex-col justify-center overflow-hidden py-8 [@media_(max-height:1100px)]:py-6">
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
                    className="flex h-full w-full items-center justify-center overflow-hidden px-4 py-3 sm:px-6 lg:w-1/2 lg:px-12 lg:py-6 [@media_(max-height:1100px)]:py-4"
                >
                    <div className="mx-auto w-full max-w-md">
                        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white/80 p-6 py-8 shadow-xl backdrop-blur-xl [@media_(max-height:1100px)]:p-5 [@media_(max-height:1100px)]:py-6">
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
