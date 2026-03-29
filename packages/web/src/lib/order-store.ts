/**
 * Order store ใช้ localStorage + BroadcastChannel
 * ข้อมูล persist ข้าม page navigation และ sync ข้าม tab
 */

import type { ChannelSource, MenuItem, OrderDetails, OrderStatus, UnifiedOrder } from "./types"
import { recordIncomeFromOrder } from "./finance-store"

export interface SubmitOrderInput {
  channel: ChannelSource
  items: MenuItem[]
  details?: OrderDetails
  enteredBy: string
}

type SubmitResult =
  | { success: true; orderId: string; order: UnifiedOrder }
  | { success: false; error: string }

export interface StateTransition {
  fromStatus: OrderStatus
  toStatus: OrderStatus
  timestamp: number
  actor: string
  reason?: string
}

// --- Storage helpers ---
const ORDERS_KEY = "restaurant_orders"
const HISTORY_KEY = "restaurant_history"

function loadOrders(): UnifiedOrder[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(ORDERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveOrders(orders: UnifiedOrder[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

function loadHistory(): Record<string, StateTransition[]> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveHistory(history: Record<string, StateTransition[]>) {
  if (typeof window === "undefined") return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

// --- Cross-tab sync via BroadcastChannel ---
let channel: BroadcastChannel | null = null
if (typeof window !== "undefined") {
  try { channel = new BroadcastChannel("restaurant_orders_sync") } catch {}
}

let listeners: (() => void)[] = []

export function subscribe(fn: () => void): () => void {
  listeners.push(fn)
  // Listen for cross-tab updates
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

// --- Priority Engine ---
const channelWeights: Record<ChannelSource, number> = {
  grabFood: 1.2, lineMan: 1.2, shopeeFood: 1.1, walkIn: 1.0, website: 0.9,
}

function isRushHour(ts: number): boolean {
  const h = new Date(ts).getHours()
  return (h >= 11 && h < 13) || (h >= 17 && h < 20)
}

function computePriority(order: UnifiedOrder, now: number): number {
  const waitMin = Math.max(0, (now - order.orderTime) / 60000)
  const size = order.items.length
  const w = channelWeights[order.channel] ?? 1.0
  const rush = isRushHour(now) ? 1.3 : 1.0
  return Math.max(0, (waitMin + size + w * 10) * rush)
}

// --- State Machine ---
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  received: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["pickedUp", "cancelled"],
  pickedUp: ["delivered"],
  delivered: [],
  cancelled: [],
}

export function getValidNextStatuses(status: OrderStatus): OrderStatus[] {
  return validTransitions[status] ?? []
}

export function transitionOrder(
  orderId: string, newStatus: OrderStatus, actor: string
): { success: true } | { success: false; error: string } {
  const orders = loadOrders()
  const order = orders.find((o) => o.orderId === orderId)
  if (!order) return { success: false, error: `ไม่พบออเดอร์ ${orderId}` }

  const allowed = validTransitions[order.status]
  if (!allowed || !allowed.includes(newStatus)) {
    return { success: false, error: `ไม่สามารถเปลี่ยนจาก "${order.status}" เป็น "${newStatus}"` }
  }

  const transition: StateTransition = {
    fromStatus: order.status, toStatus: newStatus,
    timestamp: Date.now(), actor,
  }

  order.status = newStatus
  saveOrders(orders)

  const history = loadHistory()
  const h = history[orderId] ?? []
  h.push(transition)
  history[orderId] = h
  saveHistory(history)

  if (newStatus === "delivered") {
    recordIncomeFromOrder(order)
  }

  notify()
  return { success: true }
}

// --- Order CRUD ---
function generateOrderId(): string {
  const ts = Date.now()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${ts}-${rand}`
}

export function submitOrder(input: SubmitOrderInput): SubmitResult {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "ต้องมีรายการอาหารอย่างน้อย 1 รายการ" }
  }
  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { success: false, error: `จำนวนสินค้าต้องมากกว่า 0 (${item.name})` }
    }
  }
  if (!input.enteredBy || input.enteredBy.trim() === "") {
    return { success: false, error: "ต้องระบุพนักงานที่กรอกออเดอร์" }
  }

  const orders = loadOrders()
  const extId = input.details?.externalOrderId
  if (extId) {
    const dup = orders.find((o) => o.externalOrderId === extId && o.channel === input.channel)
    if (dup) {
      return { success: false, error: `ออเดอร์ซ้ำ: ${extId} ช่องทาง ${input.channel} มีอยู่แล้ว (${dup.orderId})` }
    }
  }

  const orderId = generateOrderId()
  const now = Date.now()
  const totalAmount = input.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
  const totalCost = input.items.reduce((s, i) => s + i.costPrice * i.quantity, 0)

  const order: UnifiedOrder = {
    orderId, channel: input.channel,
    externalOrderId: input.details?.externalOrderId,
    items: input.items, totalAmount, totalCost,
    customerName: input.details?.customerName,
    customerPhone: input.details?.customerPhone,
    deliveryAddress: input.details?.deliveryAddress,
    orderTime: now, status: "received",
    priorityScore: 0, notes: input.details?.notes,
    enteredBy: input.enteredBy,
  }
  order.priorityScore = computePriority(order, now)

  orders.push(order)
  saveOrders(orders)
  notify()
  return { success: true, orderId, order }
}

export function getActiveOrders(): UnifiedOrder[] {
  const now = Date.now()
  return loadOrders()
    .filter((o) => o.status !== "delivered" && o.status !== "cancelled")
    .map((o) => ({ ...o, priorityScore: computePriority(o, now) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
}

export function getOrders(): UnifiedOrder[] {
  return loadOrders()
}

export function getOrderHistory(orderId: string): StateTransition[] {
  return loadHistory()[orderId] ?? []
}

export function clearOrders(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(ORDERS_KEY)
  localStorage.removeItem(HISTORY_KEY)
  notify()
}
