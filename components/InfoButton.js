"use client";
import { useToast } from "@/components/ToastContext";

const InfoButton = ({ message, classes }) => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast(message)} className={classes}>
      💬
    </button>
  );
};

export default InfoButton;
