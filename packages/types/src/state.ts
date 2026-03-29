/**
 * @module state
 * @description Interfaces สำหรับสถานะออเดอร์และลำดับความสำคัญ
 */

import type { OrderStatus } from "./enums"

/** ประวัติการเปลี่ยนสถานะ */
export interface StateTransition {
  /** สถานะก่อนเปลี่ยน */
  fromStatus: OrderStatus
  /** สถานะหลังเปลี่ยน */
  toStatus: OrderStatus
  /** Unix timestamp ที่เปลี่ยน */
  timestamp: number
  /** พนักงานที่เปลี่ยนสถานะ */
  actor: string
  /** เหตุผล (ถ้ามี) */
  reason?: string
}

/** สถานะและประวัติของออเดอร์ */
export interface OrderState {
  /** รหัสออเดอร์ */
  orderId: string
  /** สถานะปัจจุบัน */
  currentStatus: OrderStatus
  /** ประวัติการเปลี่ยนสถานะ */
  history: StateTransition[]
  /** Unix timestamp ที่สร้าง */
  createdAt: number
  /** Unix timestamp ที่อัปเดตล่าสุด */
  updatedAt: number
}

/** ปัจจัยที่ใช้คำนวณลำดับความสำคัญ */
export type PriorityFactor =
  | { type: "channelSLA"; deadline: number }
  | { type: "waitTime"; minutes: number }
  | { type: "orderSize"; itemCount: number }
  | { type: "rushHourBoost"; multiplier: number }

/** คะแนนความสำคัญของออเดอร์ */
export interface PriorityScore {
  /** คะแนนรวม */
  score: number
  /** ปัจจัยที่ใช้คำนวณ */
  factors: PriorityFactor[]
}
