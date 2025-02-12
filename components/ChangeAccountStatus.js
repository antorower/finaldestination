"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import Link from "next/link";

const ChangeAccountStatus = ({ ChangeStatus, accountId, isOnBoarding }) => {
  return <button onClick={() => ChangeStatus({ accountId })} className={`${isOnBoarding ? "bg-red-500" : "bg-green-500"} w-3 h-3 rounded-full`}></button>;
};

export default ChangeAccountStatus;
