"use client"

import { useState, useCallback } from "react"
import type { ChannelSource, MenuItem, MenuItemTemplate, OrderDetails, UnifiedOrder } from "@/lib/types"
import { sampleMenu } from "@/lib/sample-menu"
import { apiSubmitOrder, apiGetOrders } from "@/lib/api"
import ChannelSelector from "@/components/ChannelSelector"
import MenuSelector from "@/components/MenuSelector"
import OrderDetailsForm from "@/components/OrderDetailsForm"

export default function NewOrderPage() {
  const [channel, setChannel] = useState<ChannelSource | null>(null)
  const [orderItems, setOrderItems] = useState<MenuItem[]>([])
  const [details, setDetails] = useState<OrderDetails>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successOrder, setSuccessOrder] = useState<UnifiedOrder | null>(null)
  const [recentOrders, setRecentOrders] = useState<UnifiedOrder[]>([])

  const addItem = useCallback((template: MenuItemTemplate) => {
    setOrderItems((prev) => [
      ...prev,
      {
        itemId: template.itemId,
        name: template.name,
        quantity: 1,
        unitPrice: template.unitPrice,
        costPrice: template.costPrice,
      },
    ])
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.itemId !== itemId))
  }, [])

  const updateQty = useCallback((itemId: string, qty: number) => {
    setOrderItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity: qty } : i))
    )
  }, [])

  const totalAmount = orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const resetForm = () => {
    setChannel(null)
    setOrderItems([])
    setDetails({})
    setError(null)
    setSuccessOrder(null)
  }

  const handleSubmit = async () => {
    if (!channel) return
    setSubmitting(true)
    setError(null)

    const result = await apiSubmitOrder({
      channel,
      items: orderItems,
      details,
      enteredBy: "staff1",
    })

    setSubmitting(false)

    if (!result.success) {
      setError(result.error || "เกิดข้อผิดพลาด")
      return
    }

    setSuccessOrder(result.order)
    const allOrders = await apiGetOrders()
    setRecentOrders(allOrders.slice(0, 5))
  }

  const canSubmit = channel !== null && orderItems.length > 0 && !submitting

  // Success screen — Req 1.4
  if (successOrder) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl bg-white p-8 shadow-sm text-center">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">สร้างออเดอร์สำเร็จ</h1>
            <p className="text-gray-500 mb-1">Order ID: <span className="font-mono font-semibold">{successOrder.orderId}</span></p>
            <p className="text-gray-500 mb-1">ช่องทาง: {successOrder.channel}</p>
            <p className="text-gray-500 mb-4">ยอดรวม: <span className="font-semibold">฿{successOrder.totalAmount}</span></p>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg bg-blue-500 px-6 py-3 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              สร้างออเดอร์ใหม่
            </button>
          </div>

          {/* Recent orders */}
          {recentOrders.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">ออเดอร์ล่าสุด</h2>
              <div className="space-y-2">
                {recentOrders.map((o) => (
                  <div key={o.orderId} className="rounded-lg bg-white p-3 shadow-sm flex justify-between items-center">
                    <div>
                      <span className="font-mono text-sm font-medium">{o.orderId}</span>
                      <span className="ml-2 text-xs text-gray-500">{o.channel}</span>
                    </div>
                    <div className="text-sm font-medium">฿{o.totalAmount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🍳 สร้างออเดอร์ใหม่</h1>

        <div className="space-y-6">
          {/* Step 1: Channel — Req 1.1, 1.5 */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <ChannelSelector selected={channel} onSelect={setChannel} />
          </div>

          {/* Step 2: Menu — Req 1.2, 6.1, 6.2 */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <MenuSelector
              menu={sampleMenu}
              orderItems={orderItems}
              onAdd={addItem}
              onRemove={removeItem}
              onUpdateQty={updateQty}
              disabled={!channel}
            />
          </div>

          {/* Step 3: Details — Req 1.3 */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <OrderDetailsForm
              details={details}
              onChange={setDetails}
              disabled={!channel}
            />
          </div>

          {/* Summary & Submit — Req 1.3, 1.4, 3.1 */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg text-gray-500">ยอดรวม</span>
                <span className="ml-3 text-4xl font-bold text-gray-800">฿{totalAmount}</span>
              </div>
              <span className="text-lg text-gray-400">{orderItems.length} รายการ</span>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl bg-red-50 border-2 border-red-200 px-5 py-4 text-lg text-red-700 font-semibold">
                ⚠️ {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full rounded-2xl py-5 text-white font-bold text-2xl transition-all
                ${canSubmit
                  ? "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl"
                  : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {submitting ? "⏳ กำลังส่ง..." : "✅ ยืนยันออเดอร์"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
