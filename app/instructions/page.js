import Link from "next/link";
import Menu from "@/components/Menu";

const Instructions = () => {
  return (
    <div className="flex flex-col gap-4 p-8">
      <Menu activeMenu="Guide" />
    </div>
  );
};

export default Instructions;
