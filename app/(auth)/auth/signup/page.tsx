'use client'

import { SignupForm } from "@/components/user/signup-form";
import { AudioLines } from "lucide-react";
import LightPillar from "@/components/user/decoration/LightPillar"
import { TEXTS } from "@/lib/constants";

export default function signup() {
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
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <div className="w-full h-full">
          <LightPillar
            topColor="#10b981"      // Professional Emerald (Matches your Primary)
            bottomColor="#022c22"   // Deepest Forest Green (Matches your Dark Background)
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
      </div>
    </div>
  )
}