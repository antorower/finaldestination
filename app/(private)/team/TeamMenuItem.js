import Image from "next/image";
import Link from "next/link";
import ScaleOnHover from "@/components/ScaleOnHover";

const TeamMenuItem = async ({ link, icon, color, text }) => {
  return (
    <ScaleOnHover scale={1.03} rotate="3deg" width={200} height={200}>
      <Link href={link} className={`w-[200px] h-[200px] ${color} rounded-lg p-4 flex flex-col gap-4 items-center justify-center`}>
        <div className="w-[150px] h-[120px] relative">
          <Image src={icon} alt="" fill style={{ objectFit: "contain", objectPosition: "center top" }} quality={50} priority />
        </div>
        <div className="text-white font-semibold text-lg">{text}</div>
      </Link>
    </ScaleOnHover>
  );
};

export default TeamMenuItem;
