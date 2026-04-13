import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const Button = ({
    children,
    isLoading,
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    className = '',
    leftIcon,
    rightIcon,
    ...props
}) => {
    const baseStyles = "flex items-center justify-center font-semibold rounded-xl transition-all duration-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-gradient-to-r from-[#0A2C4B] to-[#1E4A6F] text-white hover:shadow-xl hover:shadow-[#0A2C4B]/20",
        secondary: "bg-[#0F5C4A] text-white hover:bg-[#0A4A3A] hover:shadow-xl hover:shadow-[#0F5C4A]/20",
        outline: "border-2 border-slate-200 text-slate-700 bg-white hover:border-slate-300 hover:bg-slate-50",
        ghost: "text-[#0A2C4B] hover:bg-slate-100",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
        xl: "px-8 py-4 text-lg",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                    {leftIcon && <span className="mr-2">{leftIcon}</span>}
                    {children}
                    {rightIcon && <span className="ml-2">{rightIcon}</span>}
                </>
            )}
        </motion.button>
    );
};

export default Button;
