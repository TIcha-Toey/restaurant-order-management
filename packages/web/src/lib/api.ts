/**
 * API client — เรียก Next.js API routes แทน localStorage
 */

const BASE = "/api"

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  return res.json()
}

// --- Orders ---
export async function apiGetOrders(active?: boolean) {
  const q = active ? "?active=true" : ""
  return fetchJSON<any[]>(`/orders${q}`)
}

export async function apiSubmitOrder(input: {
  channel: string; items: any[]; details?: any; enteredBy: string
}) {
  return fetchJSON<{ success: boolean; orderId?: string; order?: any; error?: string }>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function apiTransitionOrder(orderId: string, newStatus: string, actor: string) {
  return fetchJSON<{ success: boolean; error?: string }>(`/orders/${orderId}/transition`, {
    method: "POST",
    body: JSON.stringify({ newStatus, actor }),
  })
}

// --- Finance ---
export async function apiGetFinance(period?: string) {
  const q = period ? `?period=${period}` : ""
  return fetchJSON<{
    incomes: any[]; expenses: any[];
    summary: { totalIncome: number; totalExpense: number; profit: number; orderCount: number }
  }>(`/finance${q}`)
}

export async function apiAddExpense(input: {
  category: string; amount: number; description: string;
  vendor?: string; isRecurring: boolean
}) {
  return fetchJSON<{ success: boolean; record?: any; error?: string }>("/finance/expenses", {
    method: "POST",
    body: JSON.stringify({ ...input, recordedBy: "owner" }),
  })
}

export async function apiDeleteExpense(recordId: string) {
  return fetchJSON<{ success: boolean }>(`/finance/expenses?id=${recordId}`, { method: "DELETE" })
}
