'use client'

import { SignupForm } from "@/components/user/signup-form";
import AuthShell from "@/components/brand/auth-shell";
import LightPillar from "@/components/user/decoration/LightPillar"

export default function signup() {
  return(
    <AuthShell
      kicker="Create your workspace"
      blurb="Set up your account and start configuring projects, prompts, and voice behavior from a consistent dashboard experience."
      visual={
        <div className="h-full w-full">
          <LightPillar
            topColor="#10b981"
            bottomColor="#022c22"
            intensity={1}
            rotationSpeed={0.4}
            glowAmount={0.005}
            pillarWidth={5.5}
            pillarHeight={0.55}
            noiseIntensity={0.3}
            pillarRotation={0}
            interactive={false}
          />
        </div>
      }
    >
      <SignupForm />
    </AuthShell>
  )
}