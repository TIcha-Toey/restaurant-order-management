"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/orders/new", label: "🍳 สร้างออเดอร์", color: "bg-blue-500" },
  { href: "/kitchen", label: "👨‍🍳 ครัว", color: "bg-orange-500" },
  { href: "/finance", label: "💰 การเงิน", color: "bg-green-500" },
  { href: "/dashboard", label: "📊 สรุป", color: "bg-purple-500" },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b-2 border-gray-200 px-4 py-3 sticky top-0 z-50">
      <div className="mx-auto max-w-6xl flex items-center justify-between">
        <span className="text-xl font-bold text-gray-800">🍽️ ร้านอาหาร</span>
        <div className="flex gap-2">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-5 py-3 text-base font-bold transition-all
                  ${active
                    ? `${link.color} text-white shadow-lg scale-105`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
