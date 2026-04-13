

const Card = ({
    children,
    className = '',
    padding = 'p-8',
    radius = 'rounded-3xl',
    shadow = 'shadow-xl',
    border = 'border border-gray-100',
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`bg-white ${padding} ${radius} ${shadow} ${border} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
