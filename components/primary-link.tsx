import Link from "next/link";

interface Props {
  title: String,
  href: string,
}

export default function PrimaryLink(props: Props) {
  return (
    <Link href={props.href} className="border py-2 px-3 rounded-full bg-green-700 hover:bg-green-600 transition-all duration-200 ease-in-out">
      {props.title}
    </Link>
  )
}