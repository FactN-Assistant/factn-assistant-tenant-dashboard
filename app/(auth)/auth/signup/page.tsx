import { SignupForm } from "@/components/user/signup-form";
import { AudioLines } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up — FactN Assistant"
}

export default function signup() {
  return(
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md border text-primary-foreground">
              <AudioLines className="size-5" color="white" />
            </div>
            FactN Assistant
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <video 
          src="/orb.mp4"
          autoPlay      // Starts the video as soon as it's ready
          loop          // Restarts the video when it finishes
          muted         // REQUIRED for autoPlay to work in most browsers
          playsInline   // Required for autoPlay on mobile browsers (iOS/Android)
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}