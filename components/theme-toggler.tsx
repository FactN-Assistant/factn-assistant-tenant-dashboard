"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ThemeTogglerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ThemeToggler({ className, ...props }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-slate-200 dark:bg-zinc-900 p-1 rounded-full w-fit border border-slate-300 dark:border-zinc-800 shadow-inner",
        className
      )}
      {...props}
    >
      {options.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              isActive ? "text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
            )}
            aria-label={`${option.label} theme`}
          >
            {isActive && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 bg-green-600 rounded-full shadow-md"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
            <Icon className="relative z-10 h-5 w-5" />
          </button>
        )
      })}
    </div>
  )
}