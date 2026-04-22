'use client'

import { LoginForm } from "@/components/user/login-form";
import AuthShell from "@/components/brand/auth-shell";
import FloatingLines from "@/components/user/decoration/FloatingLines"
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
      <AuthShell
        kicker="Session check"
        blurb="We are verifying your workspace session and refreshing access if needed."
        visual={
          <div className="h-full w-full">
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
        }
      >
        <div className="flex min-h-[320px] items-center justify-center text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AuthShell>
    );
  }

  // Only show login form if user is not authenticated
  return(
    <AuthShell
      visual={
        <div className="h-full w-full">
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
      }
    >
      <LoginForm />
    </AuthShell>
  )
}