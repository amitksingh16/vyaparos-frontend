import { motion } from 'framer-motion';
import { AlertTriangle, Clock3, MessagesSquare } from 'lucide-react';
import { revealUp } from './motion';

void motion;

const problems = [
    {
        icon: AlertTriangle,
        title: 'Deadlines hide in fragmented spreadsheets',
        description: 'Partners lose time hunting for status across clients, months, and filing categories.',
        tone: 'red',
    },
    {
        icon: Clock3,
        title: 'Follow-ups consume high-value team hours',
        description: 'Repeated reminders and document chases drag staff into reactive work instead of structured execution.',
        tone: 'orange',
    },
    {
        icon: MessagesSquare,
        title: 'WhatsApp documents break operational context',
        description: 'Critical uploads arrive quickly, but ownership and classification often stay unclear until too late.',
        tone: 'yellow',
    },
];

const toneClasses = {
    red: {
        wrap: 'border-red-100 bg-red-50/70',
        icon: 'bg-red-100 text-red-600',
    },
    orange: {
        wrap: 'border-orange-100 bg-orange-50/70',
        icon: 'bg-orange-100 text-orange-600',
    },
    yellow: {
        wrap: 'border-amber-100 bg-amber-50/70',
        icon: 'bg-amber-100 text-amber-600',
    },
};

const ProblemSection = () => {
    return (
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] py-24 sm:py-28">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.08),_transparent_40%)]" />

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    {...revealUp}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                    className="mx-auto max-w-3xl text-center"
                >
                    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-sm">
                        Why It Matters
                    </div>
                    <h2 className="mt-6 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">
                        The pain is rarely the filing. It’s the operational fog around it.
                    </h2>
                    <p className="mt-6 text-lg leading-8 text-slate-600">
                        VyaparOS is built around the real bottlenecks CA firms face when client work scales faster
                        than internal visibility.
                    </p>
                </motion.div>

                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {problems.map((problem, index) => (
                        <motion.div
                            key={problem.title}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.22 }}
                            transition={{ duration: 0.5, delay: index * 0.12, ease: 'easeOut' }}
                            whileHover={{ y: -8 }}
                            className={`rounded-[1.8rem] border p-7 shadow-[0_16px_40px_-24px_rgba(15,23,42,0.25)] transition-shadow duration-300 hover:shadow-[0_26px_60px_-28px_rgba(15,23,42,0.28)] ${toneClasses[problem.tone].wrap}`}
                        >
                            <div className={`inline-flex rounded-2xl p-3 ${toneClasses[problem.tone].icon}`}>
                                <problem.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                                {problem.title}
                            </h3>
                            <p className="mt-4 text-base leading-7 text-slate-600">
                                {problem.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemSection;
