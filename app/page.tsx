'use client'

import Aurora from "../components/Aurora"

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full">
      <div className="fixed inset-0 -z-10">
        <Aurora
          colorStops={["#2c378c", "#00ff00", "#022501", "#00ff00", "#2c378c"]}
          amplitude={3}
          blend={0.75}
        />
      </div>

      <main className="relative z-10 flex flex-col items-center justify-center pt-20">
        <p className="text-8xl font-bold text-neutral-200">FactN Assistant</p>
        
        <div className="h-[200vh]">
          <p className="mt-10">Scroll down to see the effect...</p>
        </div>
      </main>
    </div>
  )
}