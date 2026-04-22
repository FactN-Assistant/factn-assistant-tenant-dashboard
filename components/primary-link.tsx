import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  href: string
  className?: string
}

export default function PrimaryLink(props: Props) {
  return (
    <Link
      href={props.href}
      className={cn(
        buttonVariants({ variant: "default", size: "lg" }),
        "rounded-full px-4 shadow-[0_20px_40px_-24px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
        props.className
      )}
    >
      {props.title}
    </Link>
  )
}