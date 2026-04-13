import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
    Shield,
    ArrowRight,
    LayoutDashboard,
    Activity,
    AlertCircle,
    LineChart,
    CheckCircle2,
    MessageCircle,
    Building2,
    Briefcase
} from 'lucide-react';

// Fade Up Variant for Scroll Reveals
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const Home = () => {
    // Intersection Observers for triggered animations
    const [counterRef, counterInView] = useInView({ triggerOnce: true, threshold: 0.3 });
    const [featureRef, featureInView] = useInView({ triggerOnce: true, threshold: 0.2 });

    // Hover state for interactive cards
    const [hoveredFeature, setHoveredFeature] = useState(null);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#002D50] selection:text-white overflow-x-hidden">

            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-[#002D50]" />
                            <span className="text-xl md:text-2xl font-bold tracking-tight text-[#002D50]">VyaparOS</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-[#002D50] transition-colors">CA Sign In</Link>
                            <Link to="/signup?role=ca" className="text-sm font-semibold bg-[#E08A00] text-white px-5 py-2.5 rounded hover:bg-[#c47800] transition-all shadow-md shadow-[#E08A00]/20 hover:shadow-lg hover:shadow-[#E08A00]/40">Get Started for Free</Link>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-40 pb-32 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-[#011B30] via-[#002D50] to-[#0A4069] border-b border-[#002D50]/50 text-white">

                    {/* Subtle Grid Overlay */}
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                    {/* Animated Data Circuit Background (Adjusted for dark bg) */}
                    <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="circuit-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <path d="M0 50h50v50H0zM50 0h50v50H50z" fill="none" />
                                    <path d="M10 50h30v30 M60 20h30v30 M30 80v20 M80 50v50" stroke="#ffffff" strokeWidth="1" fill="none" strokeDasharray="5,5">
                                        <animate attributeName="stroke-dashoffset" from="100" to="0" dur="20s" repeatCount="indefinite" />
                                    </path>
                                    <circle cx="40" cy="50" r="2" fill="#E08A00" />
                                    <circle cx="90" cy="20" r="2" fill="#E08A00" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
                        </svg>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-16 items-center z-10">
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            animate="visible"
                            className="lg:col-span-5 max-w-2xl"
                        >
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur shadow-sm text-blue-200 text-xs font-bold uppercase tracking-widest mb-8 border border-white/20">
                                <span className="w-2 h-2 rounded-full bg-[#E08A00] animate-pulse shadow-[0_0_8px_rgba(224,138,0,0.8)]"></span>
                                Built for Enterprise CA Firms
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl md:text-6xl lg:text-[4rem] font-extrabold text-white tracking-tight mb-8 leading-[1.1]">
                                The Digital Brain <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">for Modern CA Firms</span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="text-xl text-slate-300 mb-10 leading-relaxed font-medium">
                                Automate document collection, track compliance health, and manage your team from one dashboard. Built for Indian CAs.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center gap-4">
                                <Link to="/signup?role=ca" className="relative overflow-hidden w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 group transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]">
                                    <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-[liquidFill_0.6s_ease-out_forwards]"></span>
                                    <span className="relative z-10 flex items-center gap-2">
                                        Get Started for Free
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Animated Dashboard UI Mockup */}
                        <div className="lg:col-span-7 relative w-full perspective-1000" style={{ perspective: '1200px' }}>
                            <motion.div
                                initial={{ opacity: 0, x: 50, rotateY: 20, rotateX: 5 }}
                                animate={{ opacity: 1, x: 0, rotateY: -5, rotateX: 5 }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ transformStyle: 'preserve-3d', animation: 'float 6s ease-in-out infinite' }}
                                className="w-full rounded-2xl border border-white/10 bg-white/95 backdrop-blur-xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                            >
                                {/* Glass Header */}
                                <div className="h-12 border-b border-slate-200 flex items-center px-4 justify-between bg-slate-50 text-slate-800 shadow-sm relative z-20">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                        </div>
                                        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase ml-4">VyaparOS Portfolio Console</div>
                                    </div>
                                </div>

                                <motion.div
                                variants={staggerContainer}
                                initial="hidden"
                                animate="visible"
                                className="p-4 md:p-8 flex-1 flex flex-col gap-4 md:gap-6 overflow-x-auto"
                            >
                                <div className="min-w-[550px] flex flex-col gap-4 md:gap-6">
                                    {/* Top Stats */}
                                    <div className="grid grid-cols-3 gap-3 md:gap-6">
                                        <motion.div variants={fadeInUp} className="p-3 md:p-5 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
                                            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Clients</div>
                                            <div className="text-xl md:text-3xl font-extrabold text-[#002D50]">
                                                <CountUp end={142} duration={2.5} />
                                            </div>
                                        </motion.div>
                                        <motion.div variants={fadeInUp} className="p-3 md:p-5 border border-slate-100 rounded-lg bg-white shadow-sm flex flex-col gap-1 hover:shadow-md transition-shadow">
                                            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending GSTR-1</div>
                                            <div className="text-xl md:text-3xl font-extrabold text-[#002D50]">
                                                <CountUp end={18} duration={2} />
                                            </div>
                                        </motion.div>
                                        <motion.div variants={fadeInUp} className="p-3 md:p-5 border border-red-100 rounded-lg bg-red-50/50 flex flex-col gap-1 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-l"></div>
                                            <div className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1">
                                                High Risk Entities <AlertCircle className="w-3 h-3 animate-pulse" />
                                            </div>
                                            <div className="text-xl md:text-3xl font-extrabold text-red-700">3</div>
                                        </motion.div>
                                    </div>

                                    {/* Data Table */}
                                    <motion.div variants={fadeInUp} className="flex-1 border border-slate-100 rounded-lg bg-white overflow-hidden shadow-sm">
                                        <div className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 bg-slate-50/80 border-b border-slate-100 text-[10px] md:text-xs font-bold text-[#002D50] uppercase tracking-wider">
                                            <div className="col-span-5">Client Name</div>
                                            <div className="col-span-3">Health Score</div>
                                            <div className="col-span-4">Next Deadline</div>
                                        </div>
                                        {[
                                            { name: "Acme Corp Ltd.", score: "98/100", date: "In 12 Days", status: "good" },
                                            { name: "Nexus Trading", score: "65/100", date: "Tomorrow", status: "warning" },
                                            { name: "Wayne Enterprises", score: "45/100", date: "Overdue", status: "critical" },
                                        ].map((client, i) => (
                                            <motion.div
                                                key={i}
                                                whileHover={{ x: 5, backgroundColor: "rgba(0, 45, 80, 0.02)" }}
                                                className="grid grid-cols-12 gap-2 md:gap-4 p-3 md:p-4 border-b border-slate-50 items-center text-xs md:text-sm font-medium transition-colors cursor-default"
                                            >
                                                <div className="col-span-5 text-[#002D50] flex items-center gap-2 md:gap-3">
                                                    {client.status === 'good' ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-green-500 flex-shrink-0" /> : client.status === 'critical' ? <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-500 flex-shrink-0" /> : <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-amber-500 flex-shrink-0" />}
                                                    <span className="truncate">{client.name}</span>
                                                </div>
                                                <div className="col-span-3 flex items-center">
                                                    <div className="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden mr-2 max-w-[40px] md:max-w-[60px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${parseInt(client.score)}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                                                            className={`h-full rounded-full ${client.status === 'good' ? 'bg-green-500' : client.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        />
                                                    </div>
                                                    <span className={`text-[10px] md:text-xs font-bold whitespace-nowrap ${client.status === 'good' ? 'text-green-700' : client.status === 'warning' ? 'text-amber-700' : 'text-red-700'}`}>
                                                        {client.score}
                                                    </span>
                                                </div>
                                                <div className={`col-span-4 font-bold whitespace-nowrap ${client.status === 'critical' ? 'text-red-600' : 'text-slate-600'}`}>{client.date}</div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

                {/* LIVE COUNTERS SECTION */}
                <section ref={counterRef} className="py-16 bg-white border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center">
                            <motion.div
                                animate={counterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                className="p-8 transition-transform duration-300 cursor-default flex flex-col items-center justify-center"
                            >
                                <Building2 className="w-10 h-10 text-[#E08A00] mb-6" />
                                <div className="text-xl font-bold text-[#002D50] leading-snug">
                                    Built for modern CA firms managing multi-client compliance
                                </div>
                            </motion.div>
                            <motion.div
                                animate={counterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.2 }}
                                className="p-8 transition-transform duration-300 cursor-default flex flex-col items-center justify-center"
                            >
                                <Briefcase className="w-10 h-10 text-[#E08A00] mb-6" />
                                <div className="text-xl font-bold text-[#002D50] leading-snug">
                                    Designed to scale from 10 to 1000+ clients
                                </div>
                            </motion.div>
                            <motion.div
                                animate={counterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                                transition={{ delay: 0.4 }}
                                className="p-8 transition-transform duration-300 cursor-default flex flex-col items-center justify-center"
                            >
                                <Shield className="w-10 h-10 text-[#E08A00] mb-6" />
                                <div className="text-xl font-bold text-[#002D50] leading-snug">
                                    Centralized compliance control for better visibility
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* THE CONTROL ROOM - WITH INTERACTIVE CARDS */}
                <section ref={featureRef} className="py-32 bg-slate-50/50 border-b border-slate-200 overflow-hidden relative">
                    <div className="absolute -top-[300px] -right-[300px] w-[600px] h-[600px] rounded-full bg-[#E08A00]/5 blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-[300px] -left-[300px] w-[600px] h-[600px] rounded-full bg-[#002D50]/5 blur-3xl pointer-events-none"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <motion.div
                            initial="hidden"
                            animate={featureInView ? "visible" : "hidden"}
                            variants={fadeInUp}
                            className="max-w-3xl mx-auto mb-20"
                        >
                            <div className="inline-block px-4 py-1.5 rounded-full bg-[#002D50]/5 text-[#002D50] font-bold tracking-widest text-xs uppercase mb-6 border border-[#002D50]/10">Features</div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#002D50] mb-8 tracking-tight leading-[1.15]">
                                The Compliance Control Room
                            </h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                Engineered for reliability. VyaparOS provides real-time portfolio monitoring and overdue detection within a unified glassmorphic architecture.
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    id: 'unified',
                                    icon: LayoutDashboard,
                                    title: "Unified Portfolio View",
                                    desc: "Aggregate all your clients into one responsive dashboard.",
                                    animation: (
                                        <div className="w-full flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="h-8 flex-1 bg-slate-200 rounded animate-pulse"></div>
                                            <div className="h-8 flex-1 bg-slate-200 rounded animate-pulse delay-75"></div>
                                        </div>
                                    )
                                },
                                {
                                    id: 'health',
                                    icon: LineChart,
                                    title: "Health Analytics",
                                    desc: "Track global compliance scores natively to predict risk.",
                                    animation: (
                                        <div className="w-full flex items-end gap-1 mt-4 h-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {[40, 70, 50, 90, 60].map((h, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    whileHover={{ height: `${h}%` }}
                                                    animate={{ height: `${h}%` }}
                                                    className="flex-1 bg-indigo-400 rounded-t"
                                                />
                                            ))}
                                        </div>
                                    )
                                },
                                {
                                    id: 'overdue',
                                    icon: AlertCircle,
                                    title: "Overdue Detection",
                                    desc: "Smart triggers instantly flag entities slipping past deadlines.",
                                    animation: (
                                        <div className="w-full mt-4 p-2 bg-red-50 text-red-600 text-xs font-bold rounded flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2">
                                            <AlertCircle size={14} /> 3 Action Required
                                        </div>
                                    )
                                },
                                {
                                    id: 'audit',
                                    icon: Activity,
                                    title: "Immutable Audit Trail",
                                    desc: "Secure history of every notification and upload. Never lose a WhatsApp document again.",
                                    animation: (
                                        <div className="w-full mt-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                            <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                                        </div>
                                    )
                                }
                            ].map((feature, i) => (
                                <motion.div
                                    key={feature.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={featureInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                                    transition={{ delay: i * 0.15, duration: 0.5 }}
                                    onHoverStart={() => setHoveredFeature(feature.id)}
                                    onHoverEnd={() => setHoveredFeature(null)}
                                    className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 text-left shadow-xl shadow-slate-200/50 hover:border-indigo-500/30 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group cursor-default relative overflow-hidden"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br from-[#002D50]/0 to-[#002D50]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                                    <div className="relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-blue-50/80 border border-blue-100 shadow-sm flex items-center justify-center mb-6 overflow-hidden relative group-hover:border-blue-300 group-hover:bg-blue-100 transition-colors duration-300">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <feature.icon className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors relative z-10" />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#002D50] mb-3 leading-tight tracking-tight">{feature.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed">{feature.desc}</p>

                                        <div className="h-14 overflow-hidden">
                                            {feature.animation}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* TRUST & TESTIMONIALS SECTION */}
                <section className="py-24 bg-white border-b border-slate-200 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Currently onboarding <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-[#E08A00]">early CA partners</span>.</h2>
                            <p className="mt-4 text-xl text-slate-500 font-medium">Designed in collaboration with practicing Chartered Accountants.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <AlertCircle className="w-10 h-10 text-red-500 mb-6 opacity-80" />
                                <p className="text-slate-700 text-lg font-semibold leading-relaxed">"Tracking deadlines across multiple clients is chaotic"</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <AlertCircle className="w-10 h-10 text-amber-500 mb-6 opacity-80" />
                                <p className="text-slate-700 text-lg font-semibold leading-relaxed">"Manual follow-ups waste hours every week"</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <AlertCircle className="w-10 h-10 text-orange-500 mb-6 opacity-80" />
                                <p className="text-slate-700 text-lg font-semibold leading-relaxed">"No clear visibility on compliance risk"</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA SECTION */}
                <section className="relative py-32 bg-[#011B30] overflow-hidden text-center px-4 border-t border-[#002D50]/50">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[150px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[150px] opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7 }}
                        viewport={{ once: true }}
                        className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
                    >
                        <Shield className="w-16 h-16 text-blue-400 mx-auto mb-8 opacity-90 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
                            Deploy VyaparOS In Your Firm.
                        </h2>
                        <p className="text-xl text-slate-300 mb-12 font-medium max-w-2xl mx-auto">
                            Robust infrastructure for disciplined, automated compliance operations on a grand scale.
                        </p>
                        
                        <div className="relative inline-block group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                            <Link to="/signup?role=ca" className="relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 border border-blue-400/30 text-white rounded-lg font-bold text-lg transition-all group-hover:-translate-y-1">
                                Get Started for Free
                                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <p className="text-slate-400 mt-6 text-sm font-medium tracking-wide">
                            No setup required • Cancel anytime
                        </p>
                    </motion.div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-[#011B30] border-t border-[#002D50]/50 text-slate-400 py-12 text-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Shield className="w-6 h-6 text-slate-500" />
                        <span className="font-extrabold text-white tracking-widest text-sm uppercase">VyaparOS</span>
                    </div>
                    <p className="font-medium">&copy; {new Date().getFullYear()} VyaparOS Infrastructure. All rights reserved.</p>
                    <div className="flex gap-8 font-medium">
                        <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default Home;
