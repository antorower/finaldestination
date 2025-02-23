import Link from "next/link";
import Image from "next/image";

export default function MainMenuSkeleton() {
  return (
    <div className="text-white w-[60px] h-full overflow-x-hidden flex flex-col justify-between">
      <div className="w-full border-b border-gray-800 p-4 text-center relative flex justify-center items-center">⚫</div>
      <div className="overflow-y-auto overflow-x-hidden h-full flex flex-col text-gray-500 text-sm">
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
        <MenuItem />
      </div>
      <div className="flex items-center justify-center p-4 border-t border-gray-800">⚫</div>
    </div>
  );
}

const MenuItem = () => {
  return (
    <div className="animate-pulse">
      <div className="px-4  py-4 flex gap-4 items-center w-[250px] justify-between overflow-x-hidden text-gray-300">
        <div className="flex items-center gap-6">
          <div className="text-xl">⚫</div>
          <div className="text-base bg-gray-900 w-[100px] h-[10px]"></div>
        </div>
        <div className="text-xl">⚫</div>
      </div>
    </div>
  );
};
