import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PageMotion({ children }: { children: ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-col gap-6 p-6"
        >
            {children}
        </motion.div>
    );
}
