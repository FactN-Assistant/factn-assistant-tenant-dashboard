import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  href: string
  className?: string
}

export default function SecondaryLink(props: Props) {
  return (
    <Link
      href={props.href}
      className={cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "rounded-full border-border/70 bg-background/70 px-4 backdrop-blur-md",
        props.className
      )}
    >
      {props.title}
    </Link>
  )
}