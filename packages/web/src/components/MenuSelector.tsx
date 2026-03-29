"use client"

import { useState } from "react"
import type { MenuItemTemplate, MenuItem } from "@/lib/types"

interface Props {
  menu: MenuItemTemplate[]
  orderItems: MenuItem[]
  onAdd: (item: MenuItemTemplate) => void
  onRemove: (itemId: string) => void
  onUpdateQty: (itemId: string, qty: number) => void
  disabled: boolean
}

export default function MenuSelector({ menu, orderItems, onAdd, onRemove, onUpdateQty, disabled }: Props) {
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const available = menu.filter((m) => m.isAvailable)
  const categories = [...new Set(available.map((m) => m.category))]

  const filtered = available.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || m.category === activeCategory
    return matchSearch && matchCat
  })

  const inOrder = new Set(orderItems.map((i) => i.itemId))

  const categoryLabels: Record<string, string> = {
    rice: "🍚 ข้าว", noodle: "🍜 เส้น", soup: "🍲 แกง/ต้ม",
    salad: "🥗 ยำ/ส้มตำ", curry: "🍛 แกง", drink: "🥤 เครื่องดื่ม",
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""}>
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        2️⃣ เลือกเมนู
      </h2>

      <input
        type="text"
        placeholder="🔍 ค้นหาเมนู..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-lg mb-4 focus:outline-none focus:ring-3 focus:ring-blue-400"
        disabled={disabled}
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-5 py-2 text-base font-bold transition-all
            ${!activeCategory ? "bg-blue-500 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          ทั้งหมด
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-base font-bold transition-all
              ${activeCategory === cat ? "bg-blue-500 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto">
        {filtered.map((m) => {
          const added = inOrder.has(m.itemId)
          return (
            <button
              key={m.itemId}
              type="button"
              onClick={() => !added && onAdd(m)}
              disabled={added}
              className={`rounded-2xl border-2 p-4 text-left transition-all
                ${added
                  ? "border-green-400 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow"
                }`}
            >
              <div className="text-lg font-bold">{m.name}</div>
              <div className="text-base text-gray-500">฿{m.unitPrice}</div>
              {added && <div className="text-base text-green-600 mt-1 font-bold">✓ เพิ่มแล้ว</div>}
            </button>
          )
        })}
      </div>

      {orderItems.length > 0 && (
        <div className="mt-5 border-t-2 pt-4">
          <h3 className="text-lg font-bold text-gray-700 mb-3">
            🛒 รายการที่เลือก ({orderItems.length})
          </h3>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.itemId} className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4">
                <div>
                  <span className="text-lg font-bold">{item.name}</span>
                  <span className="text-base text-gray-500 ml-3">฿{item.unitPrice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.itemId, Math.max(1, item.quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 text-xl font-bold hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-xl font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onUpdateQty(item.itemId, item.quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 text-xl font-bold hover:bg-gray-300"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.itemId)}
                    className="ml-3 w-10 h-10 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 text-xl font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
