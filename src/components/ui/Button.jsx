import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import Loader from '../common/Loader';

const Button = ({
    children,
    isLoading,
    variant = 'primary',
    size = 'lg',
    fullWidth = false,
    className = '',
    leftIcon,
    rightIcon,
    disabled = false,
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

    const loaderSize = size === 'sm' ? 'sm' : 'md';
    const buttonDisabled = disabled || isLoading;

    return (
        <motion.button
            whileHover={buttonDisabled ? undefined : { scale: 1.02 }}
            whileTap={buttonDisabled ? undefined : { scale: 0.98 }}
            className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
            disabled={buttonDisabled}
            aria-busy={buttonDisabled}
            {...props}
        >
            {isLoading ? (
                <Loader type="button" size={loaderSize} text={children} />
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
