import { describe, it, expect } from "vitest"
import { buildOrder } from "../buildOrder"
import type { MenuItem } from "@restaurant/types"

const items: MenuItem[] = [
  { itemId: "m1", name: "ข้าวผัดกระเพรา", quantity: 2, unitPrice: 60, costPrice: 25 },
  { itemId: "m2", name: "ผัดไทย", quantity: 1, unitPrice: 70, costPrice: 30 },
]

describe("buildOrder", () => {
  // Req 2.5 — totalAmount = ผลรวม (unitPrice × quantity)
  it("calculates totalAmount correctly", () => {
    const order = buildOrder({
      channel: "grabFood",
      items,
      enteredBy: "staff1",
      currentTime: 1000,
      orderId: "ORD-1",
    })
    // 60*2 + 70*1 = 190
    expect(order.totalAmount).toBe(190)
  })

  // Req 2.6 — totalCost = ผลรวม (costPrice × quantity)
  it("calculates totalCost correctly", () => {
    const order = buildOrder({
      channel: "grabFood",
      items,
      enteredBy: "staff1",
      currentTime: 1000,
      orderId: "ORD-1",
    })
    // 25*2 + 30*1 = 80
    expect(order.totalCost).toBe(80)
  })

  // Req 2.7 — status = "received"
  it("sets status to received", () => {
    const order = buildOrder({
      channel: "walkIn",
      items,
      enteredBy: "staff1",
      currentTime: 1000,
      orderId: "ORD-1",
    })
    expect(order.status).toBe("received")
  })

  it("sets orderId and channel from input", () => {
    const order = buildOrder({
      channel: "lineMan",
      items,
      enteredBy: "staff1",
      currentTime: 1000,
      orderId: "ORD-123",
    })
    expect(order.orderId).toBe("ORD-123")
    expect(order.channel).toBe("lineMan")
  })

  it("copies details into order", () => {
    const order = buildOrder({
      channel: "grabFood",
      items,
      details: {
        customerName: "สมชาย",
        customerPhone: "0812345678",
        externalOrderId: "GRAB-001",
        notes: "เผ็ดน้อย",
      },
      enteredBy: "staff1",
      currentTime: 2000,
      orderId: "ORD-2",
    })
    expect(order.customerName).toBe("สมชาย")
    expect(order.customerPhone).toBe("0812345678")
    expect(order.externalOrderId).toBe("GRAB-001")
    expect(order.notes).toBe("เผ็ดน้อย")
    expect(order.orderTime).toBe(2000)
    expect(order.enteredBy).toBe("staff1")
  })

  it("sets priorityScore to 0 initially", () => {
    const order = buildOrder({
      channel: "walkIn",
      items,
      enteredBy: "staff1",
      currentTime: 1000,
      orderId: "ORD-1",
    })
    expect(order.priorityScore).toBe(0)
  })
})
