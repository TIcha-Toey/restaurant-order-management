"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type ExpenseCategoryType,
  type ExpenseRecord,
  type IncomeRecord,
} from "@/lib/finance-store"
import { apiGetFinance, apiAddExpense, apiDeleteExpense } from "@/lib/api"

const categoryOptions: { value: ExpenseCategoryType; label: string }[] = [
  { value: "ingredients", label: "🥬 วัตถุดิบ" },
  { value: "rent", label: "🏠 ค่าเช่า" },
  { value: "utilities", label: "💡 ค่าน้ำค่าไฟ" },
  { value: "staffWages", label: "👷 ค่าแรง" },
  { value: "equipment", label: "🔧 อุปกรณ์" },
  { value: "marketing", label: "📢 การตลาด" },
  { value: "packaging", label: "📦 บรรจุภัณฑ์" },
  { value: "delivery", label: "🚚 ค่าจัดส่ง" },
  { value: "maintenance", label: "🔨 ซ่อมบำรุง" },
  { value: "other", label: "📋 อื่นๆ" },
]

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export default function FinancePage() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [incomes, setIncomes] = useState<IncomeRecord[]>([])
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, profit: 0, orderCount: 0 })

  const [category, setCategory] = useState<ExpenseCategoryType>("ingredients")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [vendor, setVendor] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<"income" | "expense">("income")
  const [period, setPeriod] = useState<string>("today")

  const refresh = useCallback(async () => {
    const data = await apiGetFinance(period)
    setExpenses(data.expenses)
    setIncomes(data.incomes)
    setSummary(data.summary)
  }, [period])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  const handleAddExpense = async () => {
    setError(null)
    const result = await apiAddExpense({
      category, amount: parseFloat(amount) || 0,
      description, vendor: vendor || undefined, isRecurring,
    })
    if (!result.success) {
      setError(result.error || "เกิดข้อผิดพลาด")
      return
    }
    setAmount("")
    setDescription("")
    setVendor("")
    setIsRecurring(false)
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">💰 รายรับ-รายจ่าย</h1>

        {/* Period filter */}
        <div className="flex gap-3 mb-6">
          {[
            { value: "today", label: "📅 วันนี้" },
            { value: "week", label: "📆 สัปดาห์นี้" },
            { value: "month", label: "🗓️ เดือนนี้" },
            { value: "all", label: "📋 ทั้งหมด" },
          ].map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`rounded-xl px-6 py-3 text-lg font-bold transition-all
                ${period === p.value
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* สรุปยอด — ใหญ่ ชัด อ่านง่าย */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-6 text-center">
            <div className="text-lg text-green-600 font-bold mb-1">💵 รายรับสุทธิ</div>
            <div className="text-4xl font-bold text-green-700">฿{summary.totalIncome.toLocaleString()}</div>
            <div className="text-base text-green-500 mt-1">{summary.orderCount} ออเดอร์</div>
          </div>
          <div className="rounded-2xl bg-red-50 border-2 border-red-300 p-6 text-center">
            <div className="text-lg text-red-600 font-bold mb-1">💸 รายจ่ายรวม</div>
            <div className="text-4xl font-bold text-red-700">฿{summary.totalExpense.toLocaleString()}</div>
            <div className="text-base text-red-500 mt-1">{expenses.length} รายการ</div>
          </div>
          <div className={`rounded-2xl border-2 p-6 text-center ${summary.profit >= 0 ? "bg-blue-50 border-blue-300" : "bg-orange-50 border-orange-300"}`}>
            <div className="text-lg font-bold mb-1" style={{ color: summary.profit >= 0 ? "#1d4ed8" : "#c2410c" }}>
              {summary.profit >= 0 ? "📈 กำไร" : "📉 ขาดทุน"}
            </div>
            <div className={`text-4xl font-bold ${summary.profit >= 0 ? "text-blue-700" : "text-orange-700"}`}>
              ฿{Math.abs(summary.profit).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* ซ้าย: ฟอร์มบันทึกรายจ่าย */}
          <div className="col-span-2 rounded-2xl bg-white p-6 shadow-sm border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-700 mb-5">📝 บันทึกรายจ่าย</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="category" className="block text-base text-gray-600 mb-2 font-bold">หมวดหมู่</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategoryType)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-lg font-semibold"
                >
                  {categoryOptions.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="amount" className="block text-base text-gray-600 mb-2 font-bold">จำนวนเงิน (บาท)</label>
                <input
                  id="amount" type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-2xl font-bold"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="desc" className="block text-base text-gray-600 mb-2 font-bold">รายละเอียด</label>
                <input
                  id="desc" type="text" value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-lg"
                  placeholder="เช่น ซื้อผักตลาดเช้า"
                />
              </div>
              <div>
                <label htmlFor="vendor" className="block text-base text-gray-600 mb-2 font-bold">ร้านค้า/ผู้ขาย</label>
                <input
                  id="vendor" type="text" value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-300 px-4 py-4 text-lg"
                  placeholder="ไม่บังคับ"
                />
              </div>
              <label className="flex items-center gap-3 text-lg text-gray-600 font-semibold">
                <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-6 h-6" />
                รายจ่ายประจำ (เช่น ค่าเช่ารายเดือน)
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 border-2 border-red-200 px-4 py-3 text-lg text-red-700 font-bold">⚠️ {error}</div>
              )}

              <button
                type="button" onClick={handleAddExpense}
                className="w-full rounded-xl bg-red-500 py-4 text-white text-xl font-bold hover:bg-red-600 transition-all shadow-lg"
              >
                💸 บันทึกรายจ่าย
              </button>
            </div>
          </div>

          {/* ขวา: รายการ */}
          <div className="col-span-3 rounded-2xl bg-white p-6 shadow-sm border-2 border-gray-100">
            {/* Tab switcher */}
            <div className="flex gap-3 mb-5">
              <button
                type="button" onClick={() => setTab("income")}
                className={`rounded-xl px-6 py-3 text-lg font-bold transition-all ${tab === "income" ? "bg-green-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                💵 รายรับ ({incomes.length})
              </button>
              <button
                type="button" onClick={() => setTab("expense")}
                className={`rounded-xl px-6 py-3 text-lg font-bold transition-all ${tab === "expense" ? "bg-red-500 text-white shadow-lg" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                💸 รายจ่าย ({expenses.length})
              </button>
            </div>

            {/* รายรับ */}
            {tab === "income" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {incomes.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-xl text-gray-400">ยังไม่มีรายรับ</p>
                    <p className="text-base text-gray-400">ออเดอร์ต้อง "ส่งแล้ว" ถึงจะบันทึกรายรับ</p>
                  </div>
                )}
                {incomes.map((r) => (
                  <div key={r.recordId} className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-5 py-4">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{r.description}</div>
                      <div className="text-base text-gray-500">
                        {r.channel && <span className="mr-2">{r.channel}</span>}
                        {r.commissionRate > 0 && <span>• ค่าคอม {(r.commissionRate * 100).toFixed(0)}%</span>}
                        <span className="ml-2 text-gray-400">{formatDate(r.recordedAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">+฿{r.netAmount.toLocaleString()}</div>
                      {r.commissionAmount > 0 && (
                        <div className="text-sm text-gray-400">ก่อนหัก ฿{r.grossAmount.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* รายจ่าย */}
            {tab === "expense" && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {expenses.length === 0 && (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-xl text-gray-400">ยังไม่มีรายจ่าย</p>
                  </div>
                )}
                {expenses.map((e) => (
                  <div key={e.recordId} className="flex items-center justify-between rounded-xl bg-red-50 border border-red-200 px-5 py-4">
                    <div>
                      <div className="text-lg font-bold text-gray-800">{e.description}</div>
                      <div className="text-base text-gray-500">
                        {categoryOptions.find((c) => c.value === e.category)?.label}
                        {e.vendor && <span className="ml-2">• {e.vendor}</span>}
                        <span className="ml-2 text-gray-400">{formatDate(e.recordedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-red-600">-฿{e.amount.toLocaleString()}</div>
                      <button
                        type="button"
                        onClick={async () => { await apiDeleteExpense(e.recordId); refresh() }}
                        className="w-10 h-10 rounded-xl bg-red-100 text-red-500 hover:bg-red-200 text-xl font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
