import { Suspense } from "react";
import MainMenu from "@/components/MainMenu/MainMenu";
import MainMenuSkeleton from "@/components/MainMenu/MainMenuSkeleton";

export default function Layout({ children }) {
  return (
    <div className={`grid grid-cols-[auto,1fr] h-dvh`}>
      <div className="h-dvh">
        <Suspense fallback={<MainMenuSkeleton />}>
          <MainMenu />
        </Suspense>
      </div>
      <div className="bg-white border rounded-l-[25px] border-gray-300 p-8 overflow-y-auto">{children}</div>
    </div>
  );
}
