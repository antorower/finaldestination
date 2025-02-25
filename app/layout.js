import { Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "react-toastify";
import User from "@/models/User";
import dbConnect from "@/dbConnect";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import RegisterForm from "@/components/RegisterForm";
import { revalidatePath } from "next/cache";
import { clerkClient } from "@clerk/nextjs/server";
import { Suspense } from "react";
import MainMenuSkeleton from "@/components/MainMenu/MainMenuSkeleton";
import MainMenu from "@/components/MainMenu/MainMenu";
import { ToastProvider } from "@/components/ToastContext";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "greek"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export const RegisterUser = async ({ firstName, lastName, telephone, bybitEmail, bybitUid }) => {
  "use server";
  const { sessionClaims } = await auth();

  try {
    await dbConnect();
    const newUser = new User({
      clerkId: sessionClaims.userId,
      firstName: firstName,
      lastName: lastName,
      telephone: telephone,
      bybitEmail: bybitEmail,
      bybitUid: bybitUid,
    });
    await newUser.save();

    const client = await clerkClient();
    await client.users.updateUserMetadata(sessionClaims.userId, {
      publicMetadata: {
        isOwner: false,
        isAdmin: false,
        isLeader: false,
        mongoId: newUser._id.toString(),
      },
    });

    return { error: false, message: "Η εγγραφή σου έγινε επιτυχώς" };
  } catch (error) {
    console.error("Error κατά την διάρκεια εγγραφής: ", error);
    return { error: true, message: error.message };
  } finally {
    revalidatePath("/", "layout");
  }
};
export const GetUser = async () => {
  "use server";
  try {
    await dbConnect();
    const { sessionClaims } = await auth();
    return await User.findOne({ clerkId: sessionClaims.userId }).select("accepted");
  } catch (error) {
    console.log("Υπήρξε error στην GetUser στο root layout", error);
    return false;
  }
};

export default async function RootLayout({ children }) {
  const user = await GetUser();
  return (
    <html lang="en">
      <ClerkProvider>
        <body className={`${roboto.variable} font-roboto antialiased flex flex-col bg-gray-950 text-black`}>
          {user && user.accepted && sessionClaims.userId && (
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
          {user && !user.accepted && sessionClaims.userId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
                <div className="relative w-full h-full hidden md:block">
                  <Image src="/business-man.jpg" alt="Επαγγελματίας άνδρας" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
                </div>
                <div className="p-4 overflow-y-auto flex flex-col w-full items-center justify-center animate-pulse">
                  <div className="text-lg text-gray-800">Η εγγραφή σου έγινε επιτυχώς</div>
                  <div className="text-sm text-gray-500">Περίμενε έγκριση από τους διαχειριστές</div>
                </div>
              </div>
            </>
          )}
          {!user && sessionClaims.userId && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr] h-dvh bg-gray-50">
                <div className="relative w-full h-full hidden md:block">
                  <Image src="/business-man.jpg" alt="Επαγγελματίας άνδρας" fill style={{ objectFit: "cover", objectPosition: "center top" }} quality={50} priority />
                </div>
                <div className="p-4 overflow-y-auto flex flex-col w-full items-center justify-center">
                  <RegisterForm RegisterUser={RegisterUser} />
                </div>
              </div>
            </>
          )}
          <ToastContainer position="bottom-right" autoClose={8000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable={false} pauseOnHover theme="dark" />
        </body>
      </ClerkProvider>
    </html>
  );
}
