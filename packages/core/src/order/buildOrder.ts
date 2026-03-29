/**
 * @module buildOrder
 * @description สร้าง UnifiedOrder จาก input — คำนวณ totalAmount, totalCost อัตโนมัติ
 *
 * Requirements: 2.4, 2.5, 2.6, 2.7
 */

import type { ChannelSource, MenuItem, OrderDetails, UnifiedOrder } from "@restaurant/types"

export interface BuildOrderInput {
  channel: ChannelSource
  items: MenuItem[]
  details?: OrderDetails
  enteredBy: string
  currentTime: number
  orderId: string
}

/**
 * สร้าง UnifiedOrder จาก input
 * - คำนวณ totalAmount = ผลรวม (unitPrice × quantity) (Req 2.5)
 * - คำนวณ totalCost = ผลรวม (costPrice × quantity) (Req 2.6)
 * - กำหนด status = "received" (Req 2.7)
 */
export function buildOrder(input: BuildOrderInput): UnifiedOrder {
  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  const totalCost = input.items.reduce(
    (sum, item) => sum + item.costPrice * item.quantity,
    0
  )

  return {
    orderId: input.orderId,
    channel: input.channel,
    externalOrderId: input.details?.externalOrderId,
    items: input.items,
    totalAmount,
    totalCost,
    customerName: input.details?.customerName,
    customerPhone: input.details?.customerPhone,
    deliveryAddress: input.details?.deliveryAddress,
    orderTime: input.currentTime,
    status: "received",
    priorityScore: 0,
    notes: input.details?.notes,
    enteredBy: input.enteredBy,
  }
}
