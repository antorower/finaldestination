"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";

export default function LeftBar({ active, isOwner, isLeader, isAdmin }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.aside initial={false} animate={{ width: isExpanded ? 250 : 60 }} className="text-white h-full overflow-x-hidden flex flex-col justify-between">
      <button onClick={() => setIsExpanded(!isExpanded)} className="w-full border-b border-gray-800 p-4 text-center relative flex justify-center items-center">
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.span key="close" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
              ❌
            </motion.span>
          ) : (
            <motion.span key="circle" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} transition={{ duration: 0.3 }}>
              🔵
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <div className="overflow-y-auto overflow-x-hidden h-full flex flex-col text-gray-500 text-sm">
        {isOwner && <MenuItem icon="/dashboard.svg" iconSize={23} text="Admin" link="/admin" symbol="💪" />}
        <MenuItem icon="/team.svg" text="Εργασίες" link="/" symbol="" />
        <MenuItem icon="/team.svg" text="Profile" link="/" symbol={active ? "🔵" : "🔴"} />
        <MenuItem icon="/team.svg" text="Accounts" link="/" symbol="" />
        <MenuItem icon="/team.svg" text="Trades" link="/instructions" symbol="" />
        <MenuItem icon="/calendar-gray.svg" text="Πρόγραμμα" link="/" symbol="🕛" />
        <MenuItem icon="/team.svg" text="Ταμείο" link="/" symbol="" />
        <MenuItem icon="/team.svg" text="Στατιστικά" link="/" symbol="" />
        <MenuItem icon="/team.svg" text="Ρυθμίσεις" link="/" symbol="" />
        {isLeader && <MenuItem icon="/team.svg" text="Ομάδα" link="/" symbol="" />}
        {isLeader && <MenuItem icon="/team.svg" text="Διαχείριση" link="/" symbol="" />}
        <MenuItem icon="/team.svg" text="Οδηγοί" link="/" symbol="" />
      </div>
      <div className="flex items-center justify-center p-4 border-t border-gray-800">
        <UserButton />
      </div>
    </motion.aside>
  );
}

const MenuItem = ({ icon, iconSize, text, link, symbol }) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }}>
      <Link href={link} className="px-4  py-4 flex gap-4 items-center w-[250px] justify-between overflow-x-hidden text-gray-300">
        <div className="flex items-center gap-6">
          <div className="">
            <Image src={icon} alt="" width={iconSize || 25} height={iconSize || 25} />
          </div>
          <div className="text-base">{text}</div>
        </div>
        <div>{symbol}</div>
      </Link>
    </motion.div>
  );
};
