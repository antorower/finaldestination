"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const AddAccountLink = ({ userid }) => {
  let link = "/?mode=addaccount";
  if (userid) {
    link = link + `&userid=${userid}`;
  }
  return (
    <motion.div whileHover={{ scale: 1.2 }} className="w-12 h-12 rounded-full text-white bg-orange-500">
      <Link href={link} className="text-4xl font-black w-full h-full flex justify-center items-center">
        +
      </Link>
    </motion.div>
  );
};

export default AddAccountLink;
