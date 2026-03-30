"use client"

import { useState } from "react"
import type { MenuItemTemplate } from "@/lib/types"

interface Props {
  item: MenuItemTemplate
  onConfirm: (selectedSize: string, sizeExtra: number, addOns: { name: string; price: number }[]) => void
  onClose: () => void
}

export default function MenuOptionModal({ item, onConfirm, onClose }: Props) {
  const [selectedSize, setSelectedSize] = useState(item.sizes?.[0]?.label || "")
  const [sizeExtra, setSizeExtra] = useState(item.sizes?.[0]?.extraPrice || 0)
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set())

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name); else next.add(name)
      return next
    })
  }

  const addOnsTotal = (item.addOns || [])
    .filter((a) => selectedAddOns.has(a.name))
    .reduce((s, a) => s + a.price, 0)

  const totalPrice = item.unitPrice + sizeExtra + addOnsTotal

  const handleConfirm = () => {
    const addOns = (item.addOns || []).filter((a) => selectedAddOns.has(a.name))
    onConfirm(selectedSize, sizeExtra, addOns)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{item.name}</h2>
            <p className="text-base text-gray-500">{item.description}</p>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Size selection */}
        {item.sizes && item.sizes.length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-700 mb-3">📏 เลือกขนาด</h3>
            <div className="flex gap-3">
              {item.sizes.map((size) => (
                <button key={size.label} type="button"
                  onClick={() => { setSelectedSize(size.label); setSizeExtra(size.extraPrice) }}
                  className={`flex-1 rounded-xl border-2 py-3 text-center font-bold transition-all
                    ${selectedSize === size.label
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                  <div className="text-lg">{size.label}</div>
                  {size.extraPrice > 0 && <div className="text-sm text-orange-500">+฿{size.extraPrice}</div>}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
        {item.addOns && item.addOns.length > 0 && (
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-700 mb-3">➕ เพิ่มเติม</h3>
            <div className="space-y-2">
              {item.addOns.map((addon) => (
                <button key={addon.name} type="button" onClick={() => toggleAddOn(addon.name)}
                  className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 transition-all
                    ${selectedAddOns.has(addon.name)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center text-sm
                      ${selectedAddOns.has(addon.name) ? "border-orange-500 bg-orange-500 text-white" : "border-gray-300"}`}>
                      {selectedAddOns.has(addon.name) && "✓"}
                    </div>
                    <span className="text-base font-semibold">{addon.name}</span>
                  </div>
                  <span className="text-base font-bold text-orange-500">
                    {addon.price > 0 ? `+฿${addon.price}` : "ฟรี"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total + Confirm */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg text-gray-600">ราคารวม</span>
            <span className="text-3xl font-bold text-orange-500">฿{totalPrice}</span>
          </div>
          <button type="button" onClick={handleConfirm}
            className="w-full rounded-xl bg-orange-500 py-4 text-white font-bold text-xl hover:bg-orange-600 transition-all shadow-lg">
            เพิ่มลงออเดอร์
          </button>
        </div>
      </div>
    </div>
  )
}
