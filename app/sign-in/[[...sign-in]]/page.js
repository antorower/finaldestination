import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-dvw h-dvh flex items-center justify-center">
      <SignIn />
    </div>
  );
}
