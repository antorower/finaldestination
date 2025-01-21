import Link from "next/link";
import Image from "next/image";

const AccountCard = ({ number, company, balance, phase, note }) => {
  return (
    <div className={`border border-gray-700 p-4 rounded-md flex flex-col gap-4 bg-gray-950 hover:scale-[102%] transition-transform duration-300`}>
      <div className="grid grid-cols-12">
        <div className="col-span-10 flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            {/*<div>
              <Image src="/warning.svg" width={16} height={16} alt="" /> #FixCode (εδω πρεπει να δειχνει το λογοτυπο της καθε εταιριας)
            </div>*/}
            <div className="">{company}</div>
          </div>
          <div className="text-xl">{number}</div>
          <div>
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(balance)}
          </div>
        </div>
        <div className="col-span-2 flex flex-col justify-end gap-1">
          {phase === 3 && <div className="bg-orange-400 rounded-sm h-[22px]"></div>}
          {(phase === 2 || phase === 3) && <div className={`${phase === 2 && "bg-blue-400"} ${phase === 3 && "bg-orange-400"} rounded-sm h-[22]`}></div>}
          <div className={`${phase === 1 && "bg-green-400"} ${phase === 2 && "bg-blue-400"} ${phase === 3 && "bg-orange-400"} rounded-sm h-[22]`}></div>
        </div>
      </div>
      <div className={`text-sm flex items-center justify-start gap-4 border border-gray-700 px-4 py-2 rounded ${note && note !== "" ? "animate-bounce" : "opacity-25"}`}>
        {note && note !== "" && (
          <div className="">
            <Image src="/warning.svg" width={16} height={16} alt="" />
          </div>
        )}
        <div>{note && note !== "" ? note : "-"}</div>
      </div>
      <Link className="flex justify-center p-2 bg-gray-950 border border-gray-700 rounded" href="/">
        Dashboard
      </Link>
    </div>
  );
};

export default AccountCard;
