"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { motion } from "motion/react"

type ThemeTogglerProps = React.ComponentProps<"div">

export function ThemeToggler({ className, ...props }: ThemeTogglerProps) {
  const { theme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  if (!mounted) return null

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "system", icon: Monitor, label: "System" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <div 
      className={cn(
        "brand-panel flex items-center gap-1 rounded-full p-1.5",
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
              "relative flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={`${option.label} theme`}
          >
            {isActive && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 rounded-full bg-primary shadow-md"
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