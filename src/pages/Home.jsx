import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import ProblemSection from '../components/landing/ProblemSection';
import CTASection from '../components/landing/CTASection';

void motion;

const Home = () => {
    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
            <motion.nav
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="fixed inset-x-0 top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-2xl"
            >
                <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-blue-200/70">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="text-lg font-black tracking-[-0.04em] text-slate-950 sm:text-xl">VyaparOS</div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
                                Compliance OS
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <Link
                            to="/login"
                            className="hidden rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950 sm:inline-flex"
                        >
                            Sign In
                        </Link>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/signup?role=ca"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300/50 transition-colors hover:bg-slate-800"
                            >
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.nav>

            <main>
                <HeroSection />
                <FeaturesSection />
                <ProblemSection />
                <CTASection />
            </main>

            <footer className="border-t border-slate-200 bg-white py-10 text-sm">
                <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-fuchsia-500 text-white shadow-lg shadow-blue-100/70">
                            <Shield className="h-4.5 w-4.5" />
                        </div>
                        <div>
                            <div className="font-black tracking-[-0.04em] text-slate-950">VyaparOS</div>
                            <div className="text-xs text-slate-500">Built for structured CA operations.</div>
                        </div>
                    </div>

                    <p className="text-slate-500">
                        &copy; {new Date().getFullYear()} VyaparOS. All rights reserved.
                    </p>

                    <div className="flex gap-6 text-sm font-medium text-slate-500">
                        <Link to="/terms" className="transition-colors hover:text-slate-900">
                            Terms
                        </Link>
                        <Link to="/privacy" className="transition-colors hover:text-slate-900">
                            Privacy
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
