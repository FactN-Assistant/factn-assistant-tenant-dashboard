'use client'

import { LoginForm } from "@/components/user/login-form";
import { AudioLines } from "lucide-react";
import FloatingLines from "@/components/user/decoration/FloatingLines"
import { TEXTS } from "@/lib/constants";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated (both tokens valid), redirect to dashboard
    if (user && !isLoading) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // While checking auth status or refreshing token, show loading state
  if (isLoading) {
    return (
      <div className="grid min-h-svh lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="/" className="flex items-center gap-2 self-center font-medium">
              <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500 text-primary-foreground">
                <AudioLines className="size-4" />
              </div>
              {TEXTS.APP_NAME}
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <div className="w-full h-full">
            <FloatingLines
              linesGradient={["#064e3b", "#059669", "#10b981"]}
              animationSpeed={1}
              interactive
              bendRadius={5}
              bendStrength={-0.5}
              mouseDamping={0.05}
              parallax
              parallaxStrength={0.2}
              topWavePosition={undefined} 
              middleWavePosition={undefined}          
            />
          </div>
        </div>
      </div>
    );
  }

  // Only show login form if user is not authenticated
  return(
    <div className="grid min-h-svh lg:grid-cols-[1fr_2fr]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500 text-primary-foreground">
              <AudioLines className="size-4" />
            </div>
              {TEXTS.APP_NAME}
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="w-full h-full">
          <FloatingLines
            linesGradient={["#064e3b", "#059669", "#10b981"]}
            animationSpeed={1}
            interactive
            bendRadius={5}
            bendStrength={-0.5}
            mouseDamping={0.05}
            parallax
            parallaxStrength={0.2}
            topWavePosition={undefined} 
            middleWavePosition={undefined}          
          />
        </div>
      </div>
    </div>
  )
}