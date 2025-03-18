import { Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import User from "@/models/User";
import dbConnect from "@/dbConnect";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { ToastProvider } from "@/components/ToastContext";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "greek"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Final Destination",
  description: "Final Destination System",
};

export default async function RootLayout({ children }) {
  const isTest = process.env.TEST === "is_test";
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={`${roboto.variable} font-roboto antialiased bg-gray-950 text-black`}>
          <ToastProvider>
            {isTest && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-black opacity-10 pointer-events-none select-none z-50">Test Page</div>}
            {children}
          </ToastProvider>
          <ToastContainer position="bottom-right" autoClose={8000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover theme="dark" />
        </body>
      </ClerkProvider>
    </html>
  );
}
/*

<html lang="en">
      <ClerkProvider>
        <body className={`${roboto.variable} font-roboto antialiased flex flex-col bg-gray-950 text-black`}>
          {user === 1 && <div className="bg-white flex justify-center items-center h-dvh">{children}</div>}
          {user && user.accepted && user !== 1 && (
            <>
              <div className={`grid ${user && "grid-cols-[auto,1fr]"} ${!user && "grid-cols-[1fr]"} h-dvh`}>
                <div className="h-dvh">
                  <Suspense fallback={<MainMenuSkeleton />}>
                    <MainMenu />
                  </Suspense>
                </div>
                <ToastProvider>
                  <main className="bg-white border rounded-l-[25px] border-gray-300 p-8 overflow-y-auto">{children}</main>
                </ToastProvider>
              </div>
            </>
          )}
          {user && !user.accepted && user !== 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
                <div className="relative w-full h-full hidden md:block">
                  <Image src="/business-man.jpg" alt="" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
                </div>
                <div className="p-4 overflow-y-auto flex flex-col w-full items-center justify-center">
                  <UserButton />
                  <div className="text-lg text-gray-800 animate-pulse">Η εγγραφή σου έγινε επιτυχώς</div>
                  <div className="text-sm text-gray-500 animate-pulse">Περίμενε έγκριση από τους διαχειριστές</div>
                </div>
              </div>
            </>
          )}
          {!user && user !== 1 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
                <div className="relative w-full h-full hidden md:block">
                  <Image src="/business-man.jpg" alt="Επαγγελματίας άνδρας" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
                </div>
                <div className="p-4 overflow-y-auto flex flex-col gap-2 w-full items-center justify-center">
                  <UserButton />
                  <RegisterForm RegisterUser={RegisterUser} />
                </div>
              </div>
            </>
          )}
          <ToastContainer position="bottom-right" autoClose={8000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover theme="dark" />
        </body>
      </ClerkProvider>
    </html>

    */
