"use client"

import { useState, useEffect, useCallback } from "react"
import type { UnifiedOrder } from "@/lib/types"
import { apiGetOrders, apiGetFinance } from "@/lib/api"
import { sampleMenu } from "@/lib/sample-menu"

// --- GP calculation (mirror from core) ---
function calcGP(unitPrice: number, costPrice: number) {
  return unitPrice > 0 ? ((unitPrice - costPrice) / unitPrice) * 100 : 0
}

const commissionRates: Record<string, number> = {
  grabFood: 0.30, lineMan: 0.30, shopeeFood: 0.25, walkIn: 0, website: 0,
}

const channelLabels: Record<string, string> = {
  grabFood: "🟢 GrabFood", lineMan: "🟤 LINE MAN", shopeeFood: "🟠 ShopeeFood",
  walkIn: "🚶 Walk-in", website: "🌐 Website",
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<UnifiedOrder[]>([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, profit: 0, orderCount: 0 })

  const refresh = useCallback(async () => {
    const [ordersData, financeData] = await Promise.all([apiGetOrders(), apiGetFinance()])
    setOrders(ordersData)
    setSummary(financeData.summary)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const delivered = orders.filter((o) => o.status === "delivered")

  // Channel revenue
  const channelData = ["grabFood", "lineMan", "shopeeFood", "walkIn", "website"].map((ch) => {
    const chOrders = delivered.filter((o) => o.channel === ch)
    const gross = chOrders.reduce((s, o) => s + o.totalAmount, 0)
    const rate = commissionRates[ch] ?? 0
    const commission = gross * rate
    return { channel: ch, orders: chOrders.length, gross, commission, net: gross - commission }
  }).filter((c) => c.orders > 0)

  // GP per menu item
  const menuGP = sampleMenu
    .filter((m) => m.isAvailable)
    .map((m) => ({ ...m, gp: calcGP(m.unitPrice, m.costPrice) }))
    .sort((a, b) => a.gp - b.gp)

  const lowGP = menuGP.filter((m) => m.gp < 40)

  // Order stats
  const totalOrders = orders.length
  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard</h1>

        {/* Top summary */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl bg-white border p-4 shadow-sm">
            <div className="text-xs text-gray-500">ออเดอร์ทั้งหมด</div>
            <div className="text-2xl font-bold text-gray-800">{totalOrders}</div>
          </div>
          <div className="rounded-xl bg-white border p-4 shadow-sm">
            <div className="text-xs text-gray-500">กำลังทำ</div>
            <div className="text-2xl font-bold text-orange-600">{activeOrders}</div>
          </div>
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="text-xs text-green-600">รายรับสุทธิ</div>
            <div className="text-2xl font-bold text-green-700">฿{summary.totalIncome.toLocaleString()}</div>
          </div>
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="text-xs text-red-600">รายจ่าย</div>
            <div className="text-2xl font-bold text-red-700">฿{summary.totalExpense.toLocaleString()}</div>
          </div>
          <div className={`rounded-xl border p-4 ${summary.profit >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
            <div className="text-xs text-gray-600">กำไรสุทธิ</div>
            <div className={`text-2xl font-bold ${summary.profit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              ฿{summary.profit.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Channel revenue */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">ยอดแยกตามช่องทาง</h2>
            {channelData.length === 0 ? (
              <p className="text-sm text-gray-400">ยังไม่มีออเดอร์ delivered</p>
            ) : (
              <div className="space-y-3">
                {channelData.map((c) => (
                  <div key={c.channel} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{channelLabels[c.channel]}</div>
                      <div className="text-xs text-gray-500">{c.orders} ออเดอร์ • ค่าคอม ฿{c.commission.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">฿{c.net.toLocaleString()}</div>
                      <div className="text-xs text-gray-400">สุทธิ</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* GP per menu */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">GP% ต่อเมนู</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {menuGP.map((m) => (
                <div key={m.itemId} className="flex items-center justify-between">
                  <div className="text-sm">{m.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${m.gp >= 50 ? "bg-green-500" : m.gp >= 30 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${Math.max(0, Math.min(100, m.gp))}%` }}
                      />
                    </div>
                    <span className={`text-xs font-mono w-12 text-right ${m.gp >= 50 ? "text-green-600" : m.gp >= 30 ? "text-yellow-600" : "text-red-600"}`}>
                      {m.gp.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {lowGP.length > 0 && (
              <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                <div className="text-xs text-red-600 font-semibold">⚠️ เมนู GP ต่ำ ({"<"}40%)</div>
                <div className="text-xs text-red-500">{lowGP.map((m) => m.name).join(", ")}</div>
              </div>
            )}
          </div>

          {/* Recent delivered orders */}
          <div className="col-span-2 rounded-xl bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">ออเดอร์ล่าสุดที่ส่งแล้ว</h2>
            {delivered.length === 0 ? (
              <p className="text-sm text-gray-400">ยังไม่มีออเดอร์ delivered</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="pb-2">Order ID</th>
                      <th className="pb-2">ช่องทาง</th>
                      <th className="pb-2">รายการ</th>
                      <th className="pb-2 text-right">ยอดขาย</th>
                      <th className="pb-2 text-right">ต้นทุน</th>
                      <th className="pb-2 text-right">กำไรขั้นต้น</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivered.slice(-10).reverse().map((o) => {
                      const gp = o.totalAmount - o.totalCost
                      return (
                        <tr key={o.orderId} className="border-b border-gray-100">
                          <td className="py-2 font-mono text-xs">{o.orderId.split("-").slice(-2).join("-")}</td>
                          <td className="py-2">{channelLabels[o.channel] || o.channel}</td>
                          <td className="py-2 text-gray-500">{o.items.map((i) => i.name).join(", ")}</td>
                          <td className="py-2 text-right">฿{o.totalAmount}</td>
                          <td className="py-2 text-right text-gray-500">฿{o.totalCost}</td>
                          <td className={`py-2 text-right font-medium ${gp >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ฿{gp}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          <a href="/orders/new" className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600">สร้างออเดอร์</a>
          <a href="/kitchen" className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600">Kitchen Display</a>
          <a href="/finance" className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600">การเงิน</a>
        </div>
      </div>
    </div>
  )
}
