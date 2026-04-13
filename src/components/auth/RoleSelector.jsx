// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Briefcase, Calculator, Check } from 'lucide-react';

const RoleSelector = ({ selectedRole, onSelect }) => {
    const roles = [
        {
            id: 'ca',
            title: 'Chartered Accountant',
            icon: <Calculator className="h-6 w-6" />,
            colors: {
                border: 'border-[#0A2C4B]',
                bg: 'bg-[#0A2C4B]/5',
                icon: 'text-[#0A2C4B]'
            }
        },
        {
            id: 'owner',
            title: 'Business Owner',
            icon: <Briefcase className="h-6 w-6" />,
            colors: {
                border: 'border-[#0A2C4B]',
                bg: 'bg-[#0A2C4B]/5',
                icon: 'text-[#0A2C4B]'
            }
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                    <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => onSelect(role.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
              relative p-3 rounded-xl border-2 transition-all duration-200 text-left
              ${isSelected
                                ? `${role.colors.border} ${role.colors.bg}`
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }
            `}
                    >
                        <div className={`mb-2 ${isSelected ? role.colors.icon : 'text-slate-400'}`}>
                            {role.icon}
                        </div>
                        <p className={`font-semibold text-sm leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-600'}`}>{role.title}</p>

                        {isSelected && (
                            <div className={`absolute top-2 right-2 p-0.5 rounded-full ${role.colors.bg}`}>
                                <Check className={`w-3 h-3 ${role.colors.icon}`} />
                            </div>
                        )}

                    </motion.button>
                );
            })}
        </div>
    );
};

export default RoleSelector;
