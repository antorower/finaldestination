import Link from "next/link";
import Menu from "@/components/Menu";
import PageTransition from "@/components/PageTransition";

const Instructions = () => {
  return (
    <PageTransition>
      <div className="flex flex-col gap-4 p-8">
        <Menu activeMenu="Guide" />
        <div>context</div>
      </div>
    </PageTransition>
  );
};

export default Instructions;
