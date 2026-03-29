/**
 * Finance store ใช้ localStorage + BroadcastChannel
 */

import type { ChannelSource, UnifiedOrder } from "./types"

export type ExpenseCategoryType =
  | "ingredients" | "rent" | "utilities" | "staffWages" | "equipment"
  | "marketing" | "packaging" | "delivery" | "maintenance" | "other"

export interface ExpenseRecord {
  recordId: string
  category: ExpenseCategoryType
  amount: number
  vatAmount: number
  description: string
  date: number
  vendor?: string
  isRecurring: boolean
  recordedAt: number
  recordedBy: string
}

export interface IncomeRecord {
  recordId: string
  source: "order" | "manual"
  orderId?: string
  channel?: ChannelSource
  grossAmount: number
  commissionRate: number
  commissionAmount: number
  netAmount: number
  vatAmount: number
  description: string
  recordedAt: number
}

// --- Storage ---
const INCOMES_KEY = "restaurant_incomes"
const EXPENSES_KEY = "restaurant_expenses"

function loadIncomes(): IncomeRecord[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(INCOMES_KEY) || "[]") } catch { return [] }
}
function saveIncomes(data: IncomeRecord[]) {
  if (typeof window !== "undefined") localStorage.setItem(INCOMES_KEY, JSON.stringify(data))
}
function loadExpenses(): ExpenseRecord[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(EXPENSES_KEY) || "[]") } catch { return [] }
}
function saveExpenses(data: ExpenseRecord[]) {
  if (typeof window !== "undefined") localStorage.setItem(EXPENSES_KEY, JSON.stringify(data))
}

// --- Cross-tab sync ---
let channel: BroadcastChannel | null = null
if (typeof window !== "undefined") {
  try { channel = new BroadcastChannel("restaurant_finance_sync") } catch {}
}

let listeners: (() => void)[] = []
let counter = 0

export function subscribeFinance(fn: () => void): () => void {
  listeners.push(fn)
  const handler = () => fn()
  channel?.addEventListener("message", handler)
  return () => {
    listeners = listeners.filter((l) => l !== fn)
    channel?.removeEventListener("message", handler)
  }
}
function notify() {
  listeners.forEach((fn) => fn())
  channel?.postMessage("updated")
}

const commissionRates: Record<ChannelSource, number> = {
  grabFood: 0.30, lineMan: 0.30, shopeeFood: 0.25, walkIn: 0, website: 0,
}

// --- Income ---
export function recordIncomeFromOrder(order: UnifiedOrder, isVATRegistered = false): IncomeRecord {
  const gross = order.totalAmount
  const rate = commissionRates[order.channel] ?? 0
  const commission = gross * rate
  const net = gross - commission
  const vat = isVATRegistered ? gross * 7 / 107 : 0

  const record: IncomeRecord = {
    recordId: `INC-${Date.now()}-${++counter}`,
    source: "order", orderId: order.orderId, channel: order.channel,
    grossAmount: gross, commissionRate: rate, commissionAmount: commission,
    netAmount: net, vatAmount: vat,
    description: `ออเดอร์ ${order.orderId}`, recordedAt: Date.now(),
  }

  const incomes = loadIncomes()
  incomes.push(record)
  saveIncomes(incomes)
  notify()
  return record
}

export function getIncomes(): IncomeRecord[] { return loadIncomes() }

// --- Expenses ---
export function addExpense(input: {
  category: ExpenseCategoryType; amount: number; description: string;
  vendor?: string; isRecurring: boolean
}, isVATRegistered = false, recordedBy = "owner"): { success: true; record: ExpenseRecord } | { success: false; error: string } {
  if (input.amount <= 0) return { success: false, error: "จำนวนเงินต้องมากกว่า 0" }
  if (!input.description.trim()) return { success: false, error: "กรุณากรอกรายละเอียด" }

  const record: ExpenseRecord = {
    recordId: `EXP-${Date.now()}-${++counter}`,
    category: input.category, amount: input.amount,
    vatAmount: isVATRegistered ? input.amount * 0.07 : 0,
    description: input.description, date: Date.now(),
    vendor: input.vendor, isRecurring: input.isRecurring,
    recordedAt: Date.now(), recordedBy,
  }

  const expenses = loadExpenses()
  expenses.push(record)
  saveExpenses(expenses)
  notify()
  return { success: true, record }
}

export function deleteExpenseById(id: string): boolean {
  const expenses = loadExpenses()
  const idx = expenses.findIndex((e) => e.recordId === id)
  if (idx === -1) return false
  expenses.splice(idx, 1)
  saveExpenses(expenses)
  notify()
  return true
}

export function getExpenses(): ExpenseRecord[] { return loadExpenses() }

// --- Summary ---
export function getFinanceSummary() {
  const incomes = loadIncomes()
  const expenses = loadExpenses()
  const totalIncome = incomes.reduce((s, r) => s + r.netAmount, 0)
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0)
  return {
    totalIncome, totalExpense,
    profit: totalIncome - totalExpense,
    orderCount: incomes.filter((r) => r.source === "order").length,
  }
}
