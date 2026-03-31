import Link from "next/link";

interface Props {
  title: String,
  href: string,
}

export default function SecondaryLink(props: Props) {
  return (
    <Link href={props.href} className="border py-2 px-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 ease-in-out">
      {props.title}
    </Link>
  )
}