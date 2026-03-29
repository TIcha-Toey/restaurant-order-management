/**
 * @module ExpenseManager
 * @description จัดการบันทึกรายจ่ายของร้าน
 *
 * Requirements: 9.1-9.6
 */

import type { ExpenseRecord, ExpenseInput, ExpenseFilter, DatePeriod, ExpenseSummary, CategoryExpenseSummary } from "@restaurant/types"
import type { ExpenseCategoryType } from "@restaurant/types"

let expenses: ExpenseRecord[] = []
let counter = 0

function generateExpenseId(): string {
  return `EXP-${Date.now()}-${++counter}`
}

/** Validate expense — Req 9.2, 9.3 */
export function validateExpense(input: ExpenseInput): { success: true } | { success: false; error: string } {
  if (input.amount <= 0) {
    return { success: false, error: "จำนวนเงินต้องมากกว่า 0" } // Req 9.2
  }
  if (!input.description || input.description.trim() === "") {
    return { success: false, error: "กรุณากรอกรายละเอียด" } // Req 9.3
  }
  return { success: true }
}

/** สร้าง ExpenseRecord — Req 9.1, 9.4 */
export function createExpenseRecord(
  input: ExpenseInput,
  isVATRegistered: boolean,
  recordedBy: string
): { success: true; record: ExpenseRecord } | { success: false; error: string } {
  const validation = validateExpense(input)
  if (!validation.success) return validation

  const vatAmount = isVATRegistered ? input.amount * 0.07 : 0

  const record: ExpenseRecord = {
    recordId: generateExpenseId(),
    type: "expense",
    category: input.category,
    amount: input.amount,
    vatAmount,
    description: input.description,
    date: input.date,
    receiptUrl: input.receiptUrl,
    vendor: input.vendor,
    isRecurring: input.isRecurring,
    recordedAt: Date.now(),
    recordedBy,
  }

  expenses.push(record)
  return { success: true, record }
}

/** ดึงรายจ่ายตาม filter — Req 9.6 */
export function listExpenses(filter?: ExpenseFilter): ExpenseRecord[] {
  let results = [...expenses]
  if (!filter) return results

  if (filter.category) results = results.filter((e) => e.category === filter.category)
  if (filter.startDate != null) results = results.filter((e) => e.date >= filter.startDate!)
  if (filter.endDate != null) results = results.filter((e) => e.date <= filter.endDate!)
  if (filter.minAmount != null) results = results.filter((e) => e.amount >= filter.minAmount!)
  if (filter.maxAmount != null) results = results.filter((e) => e.amount <= filter.maxAmount!)
  if (filter.vendor) results = results.filter((e) => e.vendor?.includes(filter.vendor!))
  if (filter.isRecurring != null) results = results.filter((e) => e.isRecurring === filter.isRecurring)

  return results
}

/** แก้ไขรายจ่าย — Req 9.6 */
export function updateExpense(
  expenseId: string,
  updates: Partial<ExpenseInput>
): { success: true; record: ExpenseRecord } | { success: false; error: string } {
  const idx = expenses.findIndex((e) => e.recordId === expenseId)
  if (idx === -1) return { success: false, error: `ไม่พบรายจ่าย ${expenseId}` }

  const existing = expenses[idx]
  if (updates.amount != null && updates.amount <= 0) {
    return { success: false, error: "จำนวนเงินต้องมากกว่า 0" }
  }
  if (updates.description != null && updates.description.trim() === "") {
    return { success: false, error: "กรุณากรอกรายละเอียด" }
  }

  const updated: ExpenseRecord = {
    ...existing,
    ...(updates.category != null && { category: updates.category }),
    ...(updates.amount != null && { amount: updates.amount }),
    ...(updates.description != null && { description: updates.description }),
    ...(updates.date != null && { date: updates.date }),
    ...(updates.receiptUrl !== undefined && { receiptUrl: updates.receiptUrl }),
    ...(updates.vendor !== undefined && { vendor: updates.vendor }),
    ...(updates.isRecurring != null && { isRecurring: updates.isRecurring }),
  }

  expenses[idx] = updated
  return { success: true, record: updated }
}

/** ลบรายจ่าย — Req 9.6 */
export function deleteExpense(expenseId: string): { success: true } | { success: false; error: string } {
  const idx = expenses.findIndex((e) => e.recordId === expenseId)
  if (idx === -1) return { success: false, error: `ไม่พบรายจ่าย ${expenseId}` }
  expenses.splice(idx, 1)
  return { success: true }
}

/** สรุปรายจ่ายตามช่วงเวลา */
export function getExpenseSummary(period: DatePeriod): ExpenseSummary {
  const periodExpenses = expenses.filter(
    (e) => e.date >= period.startDate && e.date <= period.endDate
  )

  const totalExpenses = periodExpenses.reduce((s, e) => s + e.amount, 0)
  const totalVATInput = periodExpenses.reduce((s, e) => s + e.vatAmount, 0)

  const categoryLabels: Record<ExpenseCategoryType, string> = {
    ingredients: "วัตถุดิบ", rent: "ค่าเช่า", utilities: "ค่าน้ำค่าไฟ",
    staffWages: "ค่าแรง", equipment: "อุปกรณ์", marketing: "การตลาด",
    packaging: "บรรจุภัณฑ์", delivery: "ค่าจัดส่ง", maintenance: "ซ่อมบำรุง", other: "อื่นๆ",
  }

  const categories: ExpenseCategoryType[] = [
    "ingredients", "rent", "utilities", "staffWages", "equipment",
    "marketing", "packaging", "delivery", "maintenance", "other",
  ]

  const byCategory: CategoryExpenseSummary[] = categories
    .map((cat) => {
      const catExpenses = periodExpenses.filter((e) => e.category === cat)
      const totalAmount = catExpenses.reduce((s, e) => s + e.amount, 0)
      return {
        category: cat,
        label: categoryLabels[cat],
        totalAmount,
        transactionCount: catExpenses.length,
        percentage: totalExpenses > 0 ? (totalAmount / totalExpenses) * 100 : 0,
      }
    })
    .filter((c) => c.transactionCount > 0)

  return { period, totalExpenses, totalVATInput, byCategory }
}

export function clearExpenses(): void {
  expenses = []
  counter = 0
}
