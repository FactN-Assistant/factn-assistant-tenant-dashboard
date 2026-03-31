'use client'

import Aurora from "../../components/user/decoration/Aurora"

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 -z-10">
        <Aurora
          colorStops={["#5227FF","#7cff67","#5227FF"]}
          amplitude={1}
          blend={0.5}
        />
      </div>
      
      <main className="relative z-10 flex flex-col items-center justify-center pt-20">
        <p className="text-8xl w-full py-3 text-center font-bold text-neutral-200 border-y">FactN Assistant</p>
        
        <div className="h-[200vh]">
          <p className="mt-10 text-5xl">Skip the AI Ops. Just Build the Experience.</p>
        </div>
      </main>
    </div>
      
  )
}