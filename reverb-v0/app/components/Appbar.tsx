"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthButtons } from "./Authbutton";
import { Providers } from "../Providers";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Appbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleGetStarted = () => {
    if (session?.user) {
      router.push("/streamspage");
    } else {
      router.push("/api/auth/signin");
    }
  };

  return (
    <header className="bg-slate-800 fixed top-0 w-full px-40 z-50 border-b border-slate-700 bg-background/80 backdrop-blur-sm bg-pink text-white">
      <nav className="container flex h-16 items-center justify-between">
        <div className="italic text-3xl font-extrabold">
          <Image
            src="/reverb-new.png"
            alt="Logo"
            width={160}
            height={136}
            className="w-40 h-[136px]"
          />
        </div>
        <div className="flex items-center gap-4">
          <Providers>
            <AuthButtons />
          </Providers>
          <Button className="bg-purple-600 hover:bg-purple-700 transition-colors duration-200" onClick={handleGetStarted}>Get Started</Button>
        </div>
      </nav>
    </header>
  );
}
