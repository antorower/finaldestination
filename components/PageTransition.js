"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransition({ children }) {
  const pathname = usePathname(); // Ανιχνεύει την τρέχουσα διαδρομή

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // Κάνει re-render κάθε φορά που αλλάζει η διαδρομή
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
