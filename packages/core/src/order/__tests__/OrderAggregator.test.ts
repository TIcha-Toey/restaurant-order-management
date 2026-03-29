import { describe, it, expect, beforeEach } from "vitest"
import { OrderAggregator } from "../OrderAggregator"
import type { MenuItem } from "@restaurant/types"

const validItems: MenuItem[] = [
  { itemId: "m1", name: "ข้าวผัดกระเพรา", quantity: 2, unitPrice: 60, costPrice: 25 },
]

describe("OrderAggregator", () => {
  let agg: OrderAggregator

  beforeEach(() => {
    agg = new OrderAggregator()
  })

  describe("submitOrder", () => {
    it("creates an order and returns orderId", () => {
      const result = agg.submitOrder({
        channel: "grabFood",
        items: validItems,
        enteredBy: "staff1",
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.orderId).toMatch(/^ORD-\d+-\d{4}$/)
      }
    })

    it("rejects invalid order (empty items)", () => {
      const result = agg.submitOrder({
        channel: "grabFood",
        items: [],
        enteredBy: "staff1",
      })
      expect(result.success).toBe(false)
    })

    it("rejects invalid order (empty enteredBy)", () => {
      const result = agg.submitOrder({
        channel: "grabFood",
        items: validItems,
        enteredBy: "",
      })
      expect(result.success).toBe(false)
    })

    // Req 3.2 — duplicate externalOrderId + channel
    it("rejects duplicate externalOrderId + channel", () => {
      agg.submitOrder({
        channel: "grabFood",
        items: validItems,
        details: { externalOrderId: "GRAB-001" },
        enteredBy: "staff1",
      })

      const result = agg.submitOrder({
        channel: "grabFood",
        items: validItems,
        details: { externalOrderId: "GRAB-001" },
        enteredBy: "staff2",
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain("ซ้ำ")
      }
    })

    it("allows same externalOrderId on different channels", () => {
      agg.submitOrder({
        channel: "grabFood",
        items: validItems,
        details: { externalOrderId: "EXT-001" },
        enteredBy: "staff1",
      })

      const result = agg.submitOrder({
        channel: "lineMan",
        items: validItems,
        details: { externalOrderId: "EXT-001" },
        enteredBy: "staff1",
      })
      expect(result.success).toBe(true)
    })

    it("allows orders without externalOrderId (no duplicate check)", () => {
      const r1 = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      const r2 = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      expect(r1.success).toBe(true)
      expect(r2.success).toBe(true)
    })
  })

  describe("getOrder", () => {
    it("returns the order by orderId", () => {
      const result = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      if (!result.success) throw new Error("should succeed")

      const order = agg.getOrder(result.orderId)
      expect(order).toBeDefined()
      expect(order!.orderId).toBe(result.orderId)
      expect(order!.channel).toBe("walkIn")
      expect(order!.status).toBe("received")
    })

    it("returns undefined for non-existent orderId", () => {
      expect(agg.getOrder("nonexistent")).toBeUndefined()
    })
  })

  describe("listOrders", () => {
    it("returns all orders when no filter", () => {
      agg.submitOrder({ channel: "grabFood", items: validItems, enteredBy: "staff1" })
      agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      expect(agg.listOrders()).toHaveLength(2)
    })

    it("filters by channel", () => {
      agg.submitOrder({ channel: "grabFood", items: validItems, enteredBy: "staff1" })
      agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      const results = agg.listOrders({ channel: "grabFood" })
      expect(results).toHaveLength(1)
      expect(results[0].channel).toBe("grabFood")
    })

    it("filters by status", () => {
      const r = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      if (r.success) agg.cancelOrder(r.orderId)

      expect(agg.listOrders({ status: "cancelled" })).toHaveLength(1)
      expect(agg.listOrders({ status: "received" })).toHaveLength(1)
    })

    it("returns empty array when no orders match filter", () => {
      agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      expect(agg.listOrders({ channel: "grabFood" })).toHaveLength(0)
    })
  })

  describe("cancelOrder", () => {
    it("cancels a received order", () => {
      const r = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      if (!r.success) throw new Error("should succeed")

      const cancel = agg.cancelOrder(r.orderId)
      expect(cancel.success).toBe(true)
      expect(agg.getOrder(r.orderId)!.status).toBe("cancelled")
    })

    it("rejects cancelling non-existent order", () => {
      const result = agg.cancelOrder("nonexistent")
      expect(result.success).toBe(false)
    })

    it("rejects cancelling already cancelled order", () => {
      const r = agg.submitOrder({ channel: "walkIn", items: validItems, enteredBy: "staff1" })
      if (!r.success) throw new Error("should succeed")

      agg.cancelOrder(r.orderId)
      const result = agg.cancelOrder(r.orderId)
      expect(result.success).toBe(false)
    })
  })
})
