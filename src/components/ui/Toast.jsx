// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    const icons = {
        success: <CheckCircle className="h-6 w-6 text-green-400" />,
        error: <XCircle className="h-6 w-6 text-red-400" />,
        warning: <AlertCircle className="h-6 w-6 text-yellow-400" />,
    };

    const bgColors = {
        success: 'bg-gray-900',
        error: 'bg-red-900',
        warning: 'bg-yellow-900',
    };

    return (
        <AnimatePresence>
            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.3 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                    className={`fixed top-5 right-5 z-[999] rounded-lg p-4 shadow-2xl flex items-center space-x-3 ${bgColors[type]} text-white min-w-[300px] border border-gray-700/50 backdrop-blur-md`}
                >
                    {icons[type]}
                    <p className="font-medium text-sm">{message}</p>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
