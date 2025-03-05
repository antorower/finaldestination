"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const AddAccountLink = ({ userId }) => {
  return (
    <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 rounded-full bg-orange-500 text-white">
      <Link href={`/admin/trader/${userId}?mode=addaccount`} className="text-4xl font-black w-full h-full flex justify-center items-center">
        +
      </Link>
    </motion.div>
  );
};

export default AddAccountLink;
