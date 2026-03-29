/**
 * @module OrderAggregator
 * @description ศูนย์กลางรับและจัดการออเดอร์ — submit, get, list, cancel
 *
 * Requirements: 2.4, 3.1, 3.2
 */

import type { ChannelSource, OrderDetails, MenuItem, UnifiedOrder, OrderStatus } from "@restaurant/types"
import { validateOrder } from "./validateOrder"
import { buildOrder } from "./buildOrder"

/** ตัวกรองสำหรับ listOrders */
export interface OrderFilter {
  channel?: ChannelSource
  status?: OrderStatus
  startDate?: number
  endDate?: number
}

/** Input สำหรับ submitOrder */
export interface SubmitOrderInput {
  channel: ChannelSource
  items: MenuItem[]
  details?: OrderDetails
  enteredBy: string
}

/** สร้าง orderId ในรูปแบบ "ORD-{timestamp}-{random4digits}" */
function generateOrderId(): string {
  const timestamp = Date.now()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${timestamp}-${random}`
}

export class OrderAggregator {
  private orders: Map<string, UnifiedOrder> = new Map()

  /**
   * รับออเดอร์ใหม่ — validate → check duplicate → generate orderId → store
   * (Req 2.4, 3.2)
   */
  submitOrder(input: SubmitOrderInput): { success: true; orderId: string } | { success: false; error: string } {
    // Validate
    const validation = validateOrder({ items: input.items, enteredBy: input.enteredBy })
    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    // Check duplicate: same externalOrderId + channel (Req 3.2)
    const externalId = input.details?.externalOrderId
    if (externalId) {
      for (const existing of this.orders.values()) {
        if (existing.externalOrderId === externalId && existing.channel === input.channel) {
          return {
            success: false,
            error: `ออเดอร์ซ้ำ: externalOrderId "${externalId}" ช่องทาง "${input.channel}" มีอยู่แล้ว (orderId: ${existing.orderId})`,
          }
        }
      }
    }

    // Generate orderId and build order
    const orderId = generateOrderId()
    const order = buildOrder({
      channel: input.channel,
      items: input.items,
      details: input.details,
      enteredBy: input.enteredBy,
      currentTime: Date.now(),
      orderId,
    })

    this.orders.set(orderId, order)
    return { success: true, orderId }
  }

  /** ดึงข้อมูลออเดอร์ตาม orderId */
  getOrder(orderId: string): UnifiedOrder | undefined {
    return this.orders.get(orderId)
  }

  /** ดึงรายการออเดอร์ตาม filter */
  listOrders(filter?: OrderFilter): UnifiedOrder[] {
    let results = Array.from(this.orders.values())

    if (filter?.channel) {
      results = results.filter((o) => o.channel === filter.channel)
    }
    if (filter?.status) {
      results = results.filter((o) => o.status === filter.status)
    }
    if (filter?.startDate != null) {
      results = results.filter((o) => o.orderTime >= filter.startDate!)
    }
    if (filter?.endDate != null) {
      results = results.filter((o) => o.orderTime <= filter.endDate!)
    }

    return results
  }

  /** ยกเลิกออเดอร์ — เปลี่ยน status เป็น cancelled ถ้า valid */
  cancelOrder(orderId: string): { success: true } | { success: false; error: string } {
    const order = this.orders.get(orderId)
    if (!order) {
      return { success: false, error: `ไม่พบออเดอร์ ${orderId}` }
    }

    const nonCancellable: OrderStatus[] = ["pickedUp", "delivered", "cancelled"]
    if (nonCancellable.includes(order.status)) {
      return {
        success: false,
        error: `ไม่สามารถยกเลิกออเดอร์ที่อยู่ในสถานะ "${order.status}"`,
      }
    }

    order.status = "cancelled"
    return { success: true }
  }
}
