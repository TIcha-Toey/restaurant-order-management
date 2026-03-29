/**
 * @module StateMachine
 * @description จัดการ lifecycle ของออเดอร์ — ควบคุมการเปลี่ยนสถานะ
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */

import type { OrderStatus, OrderState, StateTransition } from "@restaurant/types"

/** Valid transitions — Req 5.1, 5.4 */
const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  received: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["pickedUp", "cancelled"],
  pickedUp: ["delivered"],
  delivered: [],
  cancelled: [],
}

/** สร้าง OrderState ใหม่สำหรับออเดอร์ที่เพิ่งเข้าระบบ */
export function initializeOrderState(orderId: string, timestamp: number): OrderState {
  return {
    orderId,
    currentStatus: "received",
    history: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

/** ดูว่าจากสถานะปัจจุบันเปลี่ยนไปสถานะไหนได้บ้าง — Req 5.1 */
export function getValidTransitions(status: OrderStatus): OrderStatus[] {
  return validTransitions[status] ?? []
}

/**
 * เปลี่ยนสถานะออเดอร์ — Req 5.1, 5.2, 5.3, 5.4
 *
 * - ตรวจสอบว่า transition valid หรือไม่
 * - ถ้า valid → อัปเดตสถานะ + เพิ่ม history
 * - ถ้าไม่ valid → return error
 */
export function transitionOrderState(
  state: OrderState,
  newStatus: OrderStatus,
  actor: string,
  timestamp: number,
  reason?: string
): { success: true; state: OrderState } | { success: false; error: string } {
  const allowed = validTransitions[state.currentStatus]

  // Req 5.4 — delivered/cancelled ห้ามเปลี่ยน
  if (!allowed || allowed.length === 0) {
    return {
      success: false,
      error: `ไม่สามารถเปลี่ยนสถานะจาก "${state.currentStatus}" ได้ (สถานะสิ้นสุดแล้ว)`,
    }
  }

  // Req 5.2 — ตรวจสอบ valid transition
  if (!allowed.includes(newStatus)) {
    return {
      success: false,
      error: `ไม่สามารถเปลี่ยนสถานะจาก "${state.currentStatus}" เป็น "${newStatus}"`,
    }
  }

  // Req 5.3 — เพิ่ม history
  const transition: StateTransition = {
    fromStatus: state.currentStatus,
    toStatus: newStatus,
    timestamp,
    actor,
    reason,
  }

  return {
    success: true,
    state: {
      ...state,
      currentStatus: newStatus,
      history: [...state.history, transition],
      updatedAt: timestamp,
    },
  }
}
