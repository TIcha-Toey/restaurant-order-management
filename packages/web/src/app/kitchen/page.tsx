"use client"

import { useState, useEffect, useCallback } from "react"
import type { OrderStatus, UnifiedOrder } from "@/lib/types"
import { apiGetOrders, apiTransitionOrder } from "@/lib/api"

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  received: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["pickedUp", "cancelled"],
  pickedUp: ["delivered"],
  delivered: [],
  cancelled: [],
}
function getValidNextStatuses(status: OrderStatus): OrderStatus[] {
  return validTransitions[status] ?? []
}

const statusLabels: Record<OrderStatus, string> = {
  received: "📥 รับออเดอร์",
  confirmed: "✅ ยืนยันแล้ว",
  preparing: "🍳 กำลังทำ",
  ready: "🔔 เสร็จแล้ว",
  pickedUp: "🚗 รับแล้ว",
  delivered: "✅ ส่งแล้ว",
  cancelled: "❌ ยกเลิก",
}

const statusColors: Record<OrderStatus, string> = {
  received: "bg-yellow-100 border-yellow-300 text-yellow-800",
  confirmed: "bg-blue-100 border-blue-300 text-blue-800",
  preparing: "bg-orange-100 border-orange-300 text-orange-800",
  ready: "bg-green-100 border-green-300 text-green-800",
  pickedUp: "bg-purple-100 border-purple-300 text-purple-800",
  delivered: "bg-gray-100 border-gray-300 text-gray-600",
  cancelled: "bg-red-100 border-red-300 text-red-600",
}

const channelLabels: Record<string, string> = {
  grabFood: "🟢 GrabFood",
  lineMan: "🟤 LINE MAN",
  shopeeFood: "🟠 ShopeeFood",
  walkIn: "🚶 Walk-in",
  website: "🌐 Website",
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })
}

function waitTimeText(orderTime: number): string {
  const min = Math.floor((Date.now() - orderTime) / 60000)
  if (min < 1) return "เพิ่งเข้า"
  return `${min} นาที`
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([])
  const [, setTick] = useState(0)
  const [transitioning, setTransitioning] = useState<Set<string>>(new Set())

  const refresh = useCallback(async () => {
    const orders = await apiGetOrders(true)
    setOrders(orders)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(() => {
      refresh()
      setTick((t) => t + 1)
    }, 2000)
    return () => { clearInterval(interval) }
  }, [refresh])

  const handleTransition = async (orderId: string, newStatus: OrderStatus) => {
    if (transitioning.has(orderId)) return
    setTransitioning((prev) => new Set(prev).add(orderId))
    try {
      const result = await apiTransitionOrder(orderId, newStatus, "kitchen-staff")
      if (!result.success) {
        alert(result.error)
      }
      await refresh()
    } finally {
      setTransitioning((prev) => {
        const next = new Set(prev)
        next.delete(orderId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">🍳 Kitchen Display System</h1>
        <div className="flex items-center gap-3">
          <span className="text-lg text-gray-400 font-bold">{orders.length} ออเดอร์</span>
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl bg-gray-700 px-5 py-3 text-base text-gray-300 hover:bg-gray-600 font-bold"
          >
            🔄 รีเฟรช
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 text-2xl">ไม่มีออเดอร์ที่ต้องทำ 👍</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => {
            const nextStatuses = getValidNextStatuses(order.status)
            const isLoading = transitioning.has(order.orderId)
            return (
              <div
                key={order.orderId}
                className={`rounded-2xl border-3 p-5 ${statusColors[order.status]}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-base font-bold">{order.orderId.split("-").slice(-1)}</span>
                  <span className="text-base font-bold">{channelLabels[order.channel] || order.channel}</span>
                </div>

                {/* Status badge */}
                <div className="mb-3">
                  <span className="text-xl font-bold">{statusLabels[order.status]}</span>
                </div>

                {/* Items */}
                <div className="mb-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.itemId} className="flex justify-between text-lg">
                      <span className="font-semibold">{item.name}</span>
                      <span className="font-bold">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="mb-3 rounded-xl bg-white/50 px-4 py-3 text-base text-gray-700 font-semibold">
                    📝 {order.notes}
                  </div>
                )}

                {/* Meta */}
                <div className="flex justify-between text-base opacity-70 mb-4">
                  <span>⏰ {formatTime(order.orderTime)}</span>
                  <span>⏱ {waitTimeText(order.orderTime)}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {nextStatuses
                    .filter((s) => s !== "cancelled")
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleTransition(order.orderId, s)}
                        className={`flex-1 rounded-xl py-4 text-base font-bold transition-all ${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-white/80 text-gray-800 hover:bg-white shadow hover:shadow-lg"}`}
                      >
                        {isLoading ? "⏳ รอ..." : statusLabels[s]}
                      </button>
                    ))}
                  {nextStatuses.includes("cancelled") && (
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleTransition(order.orderId, "cancelled")}
                      className={`rounded-xl px-5 py-4 text-base font-bold transition-all ${isLoading ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-500/20 text-red-700 hover:bg-red-500/30"}`}
                    >
                      ❌ ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
