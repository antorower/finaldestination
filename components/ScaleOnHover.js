"use client";
import { motion } from "framer-motion";

const ScaleOnHover = ({ children, scale, rotate, width, height }) => {
  return (
    <motion.div style={{ width: `${width}px`, height: `${height}px` }} whileHover={{ scale: scale, rotate: rotate }} className="flex items-center justify-center">
      {children}
    </motion.div>
  );
};

export default ScaleOnHover;
