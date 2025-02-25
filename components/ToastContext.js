"use client";

import { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
  };

  const hideToast = () => {
    setToast(null);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast message={toast} hideToast={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

function Toast({ message, hideToast }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.5 }} className="fixed bottom-5 right-5 w-[300px] sm:w-[400px] lg:w-[500px] bg-gray-50 text-gray-500 px-4 py-2 rounded shadow-lg border border-gray-200">
          <button onClick={hideToast} className="text-justify w-full">
            {message}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
