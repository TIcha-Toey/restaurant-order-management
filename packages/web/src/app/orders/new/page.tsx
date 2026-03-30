"use client"

import { useState, useCallback } from "react"
import type { ChannelSource, MenuItem, MenuItemTemplate, OrderDetails, UnifiedOrder } from "@/lib/types"
import { sampleMenu } from "@/lib/sample-menu"
import { apiSubmitOrder } from "@/lib/api"
import ChannelSelector from "@/components/ChannelSelector"
import MenuOptionModal from "@/components/MenuOptionModal"

const categoryLabels: Record<string, string> = {
  rice: "🍚 ข้าว", noodle: "🍜 เส้น", soup: "🍲 แกง/ต้ม",
  salad: "🥗 ยำ/ส้มตำ", curry: "🍛 แกง", drink: "🥤 เครื่องดื่ม",
}
const menuEmojis: Record<string, string> = {
  rice: "🍚", noodle: "🍜", soup: "🍲", salad: "🥗", curry: "🍛", drink: "🥤",
}

export default function NewOrderPage() {
  const [channel, setChannel] = useState<ChannelSource | null>(null)
  const [orderItems, setOrderItems] = useState<MenuItem[]>([])
  const [details, setDetails] = useState<OrderDetails>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<UnifiedOrder | null>(null)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [modalItem, setModalItem] = useState<MenuItemTemplate | null>(null)
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  const available = sampleMenu.filter((m) => m.isAvailable)
  const categories = [...new Set(available.map((m) => m.category))]
  const filtered = available.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !activeCategory || m.category === activeCategory
    return matchSearch && matchCat
  })
  const totalAmount = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const totalItems = orderItems.reduce((s, i) => s + i.quantity, 0)

  const addItem = useCallback((template: MenuItemTemplate, selectedSize: string, sizeExtra: number, addOns: { name: string; price: number }[]) => {
    const addOnsTotal = addOns.reduce((s, a) => s + a.price, 0)
    const finalPrice = template.unitPrice + sizeExtra + addOnsTotal
    const sizeSuffix = selectedSize && selectedSize !== "ธรรมดา" ? ` (${selectedSize})` : ""
    const addOnNames = addOns.length > 0 ? ` + ${addOns.map((a) => a.name).join(", ")}` : ""
    setOrderItems((prev) => [...prev, {
      itemId: `${template.itemId}-${Date.now()}`,
      name: `${template.name}${sizeSuffix}${addOnNames}`,
      quantity: 1, unitPrice: finalPrice, costPrice: template.costPrice,
      selectedSize, sizeExtraPrice: sizeExtra, selectedAddOns: addOns,
    }])
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.itemId !== itemId))
  }, [])

  const updateQty = useCallback((itemId: string, qty: number) => {
    setOrderItems((prev) => prev.map((i) => (i.itemId === itemId ? { ...i, quantity: qty } : i)))
  }, [])

  const resetForm = () => {
    setChannel(null); setOrderItems([]); setDetails({})
    setError(null); setSuccessOrder(null); setSearch(""); setActiveCategory(null); setMobileCartOpen(false)
  }

  const handleSubmit = async () => {
    if (!channel || submitting) return
    setSubmitting(true); setError(null)
    const result = await apiSubmitOrder({ channel, items: orderItems, details, enteredBy: "staff1" })
    setSubmitting(false)
    if (!result.success) { setError(result.error || "เกิดข้อผิดพลาด"); return }
    setSuccessOrder(result.order)
  }

  const canSubmit = channel !== null && orderItems.length > 0 && !submitting

  // --- Order sidebar content (shared between desktop sidebar and mobile drawer) ---
  const orderSidebar = (
    <>
      <div className="p-5 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">🛒 ออเดอร์</h2>
          <button type="button" onClick={() => setChannel(null)} className="text-sm text-gray-400 hover:text-gray-600">เปลี่ยนช่องทาง</button>
        </div>
        <div className="text-base text-orange-500 font-semibold mt-1">{channel}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {orderItems.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-lg">กดเมนูด้านซ้ายเพื่อเพิ่ม</p>
          </div>
        )}
        {orderItems.map((item) => (
          <div key={item.itemId} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="text-2xl">🍽️</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{item.name}</div>
              <div className="text-sm text-orange-500 font-semibold">฿{item.unitPrice * item.quantity}</div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => updateQty(item.itemId, Math.max(1, item.quantity - 1))}
                className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold hover:bg-orange-200">−</button>
              <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
              <button type="button" onClick={() => updateQty(item.itemId, item.quantity + 1)}
                className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 font-bold hover:bg-orange-200">+</button>
            </div>
            <button type="button" onClick={() => removeItem(item.itemId)}
              className="w-8 h-8 rounded-lg bg-red-100 text-red-500 font-bold hover:bg-red-200">✕</button>
          </div>
        ))}
      </div>
      <div className="p-4 border-t space-y-3">
        <input type="text" placeholder="ชื่อลูกค้า (ไม่บังคับ)"
          value={details.customerName || ""} onChange={(e) => setDetails({ ...details, customerName: e.target.value || undefined })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
        <input type="text" placeholder="เลขออเดอร์จาก App"
          value={details.externalOrderId || ""} onChange={(e) => setDetails({ ...details, externalOrderId: e.target.value || undefined })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base" />
      </div>
      <div className="p-5 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg text-gray-600">ยอดรวม</span>
          <span className="text-3xl font-bold text-orange-500">฿{totalAmount.toLocaleString()}</span>
        </div>
        {error && <div className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-base text-red-700 font-semibold">⚠️ {error}</div>}
        <button type="button" onClick={handleSubmit} disabled={!canSubmit}
          className={`w-full rounded-xl py-4 text-white font-bold text-xl transition-all ${canSubmit ? "bg-orange-500 hover:bg-orange-600 shadow-lg" : "bg-gray-300 cursor-not-allowed"}`}>
          {submitting ? "⏳ กำลังส่ง..." : "🛒 สั่งออเดอร์"}
        </button>
      </div>
    </>
  )

  if (successOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="rounded-2xl bg-white p-10 shadow-lg text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">สร้างออเดอร์สำเร็จ</h1>
          <p className="text-lg text-gray-500 mb-1">Order ID: <span className="font-mono font-bold">{successOrder.orderId}</span></p>
          <p className="text-lg text-gray-500 mb-1">ช่องทาง: {successOrder.channel}</p>
          <p className="text-lg text-gray-500 mb-4">ยอดรวม: <span className="font-bold text-orange-500">฿{successOrder.totalAmount}</span></p>
          <button type="button" onClick={resetForm}
            className="rounded-xl bg-orange-500 px-8 py-4 text-white font-bold text-xl hover:bg-orange-600 transition-all shadow-lg">
            สร้างออเดอร์ใหม่
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {!channel && (
        <div className="bg-white border-b p-6">
          <div className="mx-auto max-w-6xl">
            <ChannelSelector selected={channel} onSelect={setChannel} />
          </div>
        </div>
      )}

      {channel && (
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left: Menu grid */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            <div className="mb-4">
              <input type="text" placeholder="🔍 ค้นหาเมนู..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 px-5 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white" />
            </div>
            <div className="flex gap-2 mb-5 flex-wrap">
              <button type="button" onClick={() => setActiveCategory(null)}
                className={`rounded-full px-4 md:px-5 py-2 text-sm md:text-base font-bold transition-all ${!activeCategory ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
                ทั้งหมด
              </button>
              {categories.map((cat) => (
                <button key={cat} type="button" onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 md:px-5 py-2 text-sm md:text-base font-bold transition-all ${activeCategory === cat ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100 border"}`}>
                  {categoryLabels[cat] || cat}
                </button>
              ))}
            </div>

            {/* Menu grid — 2 cols mobile, 3 cols desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {filtered.map((m) => {
                const emoji = menuEmojis[m.category] || "🍽️"
                return (
                  <button key={m.itemId} type="button" onClick={() => setModalItem(m)}
                    className="rounded-2xl border-2 bg-white p-3 md:p-4 text-center transition-all hover:shadow-lg border-gray-100 hover:border-orange-300">
                    <div className="text-4xl md:text-5xl mb-2 md:mb-3">{emoji}</div>
                    <div className="text-base md:text-lg font-bold text-gray-800">{m.name}</div>
                    <div className="text-xs md:text-sm text-gray-400 mt-1 hidden md:block">{m.description}</div>
                    <div className="text-lg md:text-xl font-bold text-orange-500 mt-1 md:mt-2">฿{m.unitPrice}</div>
                    {m.sizes && <div className="text-xs text-gray-400 mt-1">มีให้เลือกขนาด</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Desktop sidebar — hidden on mobile */}
          <div className="hidden md:flex w-96 bg-white border-l flex-col">
            {orderSidebar}
          </div>

          {/* Mobile: Bottom bar */}
          {orderItems.length > 0 && (
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl z-40">
              <button type="button" onClick={() => setMobileCartOpen(true)}
                className="w-full flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                    {totalItems}
                  </div>
                  <div className="text-left">
                    <div className="text-sm text-gray-500">ดูออเดอร์</div>
                    <div className="text-xs text-gray-400">{orderItems.map((i) => i.name.split(" ")[0]).join(", ")}</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-orange-500">฿{totalAmount.toLocaleString()}</div>
              </button>
            </div>
          )}

          {/* Mobile: Cart drawer */}
          {mobileCartOpen && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileCartOpen(false)} />
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold">🛒 ออเดอร์ ({totalItems})</h2>
                  <button type="button" onClick={() => setMobileCartOpen(false)} className="text-2xl text-gray-400">✕</button>
                </div>
                {orderSidebar}
              </div>
            </div>
          )}
        </div>
      )}

      {modalItem && (
        <MenuOptionModal item={modalItem}
          onConfirm={(size, sizeExtra, addOns) => { addItem(modalItem, size, sizeExtra, addOns); setModalItem(null) }}
          onClose={() => setModalItem(null)} />
      )}
    </div>
  )
}
