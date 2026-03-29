/**
 * @module PriorityEngine
 * @description คำนวณลำดับความสำคัญของออเดอร์ และจัดเรียงคิว
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import type { ChannelSource, UnifiedOrder, PriorityScore, PriorityFactor } from "@restaurant/types"

/** น้ำหนักช่องทาง — Req 4.2 */
const channelWeights: Record<ChannelSource, number> = {
  grabFood: 1.2,
  lineMan: 1.2,
  shopeeFood: 1.1,
  walkIn: 1.0,
  website: 0.9,
}

/** ตรวจสอบว่าเป็นช่วง rush hour หรือไม่ (11-13, 17-20) — Req 4.3 */
function isRushHour(timestamp: number): boolean {
  const date = new Date(timestamp)
  const hour = date.getHours()
  return (hour >= 11 && hour < 13) || (hour >= 17 && hour < 20)
}

/**
 * คำนวณ priorityScore — Req 4.1, 4.2, 4.3, 4.4
 *
 * score = (waitTimeMinutes + orderSize + channelWeight * 10) * rushMultiplier
 * score ต้อง >= 0 เสมอ (Req 4.4)
 */
export function computePriorityScore(
  order: UnifiedOrder,
  currentTime: number
): PriorityScore {
  const waitTimeMs = Math.max(0, currentTime - order.orderTime)
  const waitTimeMinutes = waitTimeMs / 60000
  const orderSize = order.items.length
  const weight = channelWeights[order.channel] ?? 1.0
  const rushMultiplier = isRushHour(currentTime) ? 1.3 : 1.0

  let score = (waitTimeMinutes + orderSize + weight * 10) * rushMultiplier
  score = Math.max(0, score) // Req 4.4

  const factors: PriorityFactor[] = [
    { type: "waitTime", minutes: Math.round(waitTimeMinutes) },
    { type: "orderSize", itemCount: orderSize },
    { type: "channelSLA", deadline: weight },
    { type: "rushHourBoost", multiplier: rushMultiplier },
  ]

  return { score, factors }
}

/**
 * จัดเรียงออเดอร์ตาม priorityScore จากมากไปน้อย — Req 4.5
 * จำนวนก่อน/หลังต้องเท่ากัน
 */
export function reorderQueue(orders: UnifiedOrder[]): UnifiedOrder[] {
  return [...orders].sort((a, b) => b.priorityScore - a.priorityScore)
}
