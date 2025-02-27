export const dynamic = "force-dynamic";

import PageTransition from "@/components/PageTransition";
const Trades = () => {
  return (
    <PageTransition>
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center text-white font-bold bg-blue-500 p-2 rounded text-2xl">Trades</div>
        <div>context</div>
      </div>
    </PageTransition>
  );
};

export default Trades;
