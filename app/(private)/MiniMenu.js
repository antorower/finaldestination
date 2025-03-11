export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import InfoButton from "@/components/InfoButton";

const MiniMenu = ({ userid }) => {
  return (
    <div className="flex flex-col gap-4 col-span-12 md:col-span-3 xl:col-span-2">
      <div className="p-4 flex w-full flex-row flex-wrap justify-between lg:flex-col gap-4 border h-auto md:h-[230px] border-gray-300 rounded">
        <MenuItem link={`/${userid ? `?userid=${userid}` : ""}`} name="Εργασίες" icon="task.svg" size={18} />
        <MenuItem link={`/?mode=accounts${userid ? `&userid=${userid}` : ""}`} name="Accounts" icon="account.svg" size={18} />
        <MenuItem link={`/?mode=tradingsettings${userid ? `&userid=${userid}` : ""}`} name="Ρυθμίσεις" icon="/settings-icon.svg" size={18} />
        <MenuItem link={`/?mode=companies${userid ? `&userid=${userid}` : ""}`} name="Εταιρίες" icon="/company-icon.svg" size={18} info="Πάτησε πάνω και ενεργοποίησε όποιες εταιρείες θέλεις να παίζεις. Αν κάποια εταιρεία δεν θέλεις να την παίζεις απλά απενεργοποίησε την." />
      </div>
    </div>
  );
};

export default MiniMenu;

const MenuItem = ({ name, link, info, icon, size }) => {
  return (
    <Link className="text-blue-500 font-semibold hover:text-blue-400 flex items-center justify-between gap-4" href={link}>
      <div className="flex items-center gap-4">
        <Image src={icon} alt="" width={size} height={size} />
        <div className="hidden md:block">{name}</div>
      </div>
      {info && <InfoButton message={info} />}
    </Link>
  );
};
