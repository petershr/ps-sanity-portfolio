import type { SettingsQueryResult } from '@/sanity.types'
import Link from 'next/link'

interface NavbarProps {
  data: SettingsQueryResult
}
export function Navbar(props: NavbarProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-5 bg-white/50 px-4 py-4 backdrop-blur-md md:px-16 md:py-5 lg:px-32 shadow-sm transition-all border-b border-gray-100/50">
      <Link
        href="/"
        className="font-extrabold text-black text-2xl tracking-tight interactive-hover"
      >
        Peter's Port.
      </Link>
      <Link
        href="/about"
        className="text-xl md:text-2xl text-gray-800 hover:text-blue-600 hover:font-semibold interactive-hover transition-colors pr-6"
      >
        About
      </Link>
    </header>
  )
}
