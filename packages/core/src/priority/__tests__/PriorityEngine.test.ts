import { describe, it, expect } from "vitest"
import { computePriorityScore, reorderQueue } from "../PriorityEngine"
import type { UnifiedOrder } from "@restaurant/types"

function makeOrder(overrides: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    orderId: "ORD-1",
    channel: "walkIn",
    items: [{ itemId: "m1", name: "ข้าวผัด", quantity: 1, unitPrice: 60, costPrice: 25 }],
    totalAmount: 60,
    totalCost: 25,
    orderTime: Date.now() - 600000, // 10 min ago
    status: "received",
    priorityScore: 0,
    enteredBy: "staff1",
    ...overrides,
  }
}

describe("computePriorityScore", () => {
  it("returns score >= 0 (Req 4.4)", () => {
    const order = makeOrder()
    const result = computePriorityScore(order, Date.now())
    expect(result.score).toBeGreaterThanOrEqual(0)
  })

  it("gives higher weight to grabFood than walkIn (Req 4.2)", () => {
    const now = Date.now()
    const baseTime = now - 300000 // 5 min ago
    const grab = makeOrder({ channel: "grabFood", orderTime: baseTime })
    const walk = makeOrder({ channel: "walkIn", orderTime: baseTime })

    const grabScore = computePriorityScore(grab, now)
    const walkScore = computePriorityScore(walk, now)
    expect(grabScore.score).toBeGreaterThan(walkScore.score)
  })

  it("applies rush hour multiplier 1.3 during 11-13 (Req 4.3)", () => {
    const order = makeOrder({ orderTime: 0 })
    // 12:00 noon
    const rushTime = new Date()
    rushTime.setHours(12, 0, 0, 0)
    const rushResult = computePriorityScore(order, rushTime.getTime())

    // 15:00 non-rush
    const normalTime = new Date()
    normalTime.setHours(15, 0, 0, 0)
    const normalResult = computePriorityScore(order, normalTime.getTime())

    // Rush hour score should be higher (same wait time base)
    expect(rushResult.score).toBeGreaterThan(normalResult.score)
  })

  it("applies rush hour multiplier during 17-20 (Req 4.3)", () => {
    const order = makeOrder({ orderTime: 0 })
    const rushTime = new Date()
    rushTime.setHours(18, 0, 0, 0)
    const result = computePriorityScore(order, rushTime.getTime())
    const rushFactor = result.factors.find((f) => f.type === "rushHourBoost")
    expect(rushFactor).toBeDefined()
    if (rushFactor && rushFactor.type === "rushHourBoost") {
      expect(rushFactor.multiplier).toBe(1.3)
    }
  })

  it("does not apply rush hour outside 11-13 and 17-20", () => {
    const order = makeOrder({ orderTime: 0 })
    const normalTime = new Date()
    normalTime.setHours(15, 0, 0, 0)
    const result = computePriorityScore(order, normalTime.getTime())
    const rushFactor = result.factors.find((f) => f.type === "rushHourBoost")
    if (rushFactor && rushFactor.type === "rushHourBoost") {
      expect(rushFactor.multiplier).toBe(1.0)
    }
  })

  it("includes all 4 factor types", () => {
    const order = makeOrder()
    const result = computePriorityScore(order, Date.now())
    const types = result.factors.map((f) => f.type)
    expect(types).toContain("waitTime")
    expect(types).toContain("orderSize")
    expect(types).toContain("channelSLA")
    expect(types).toContain("rushHourBoost")
  })

  it("longer wait time gives higher score", () => {
    const now = Date.now()
    const recent = makeOrder({ orderTime: now - 60000 }) // 1 min
    const old = makeOrder({ orderTime: now - 1800000 }) // 30 min

    const recentScore = computePriorityScore(recent, now)
    const oldScore = computePriorityScore(old, now)
    expect(oldScore.score).toBeGreaterThan(recentScore.score)
  })
})

describe("reorderQueue", () => {
  it("sorts orders by priorityScore descending (Req 4.5)", () => {
    const orders = [
      makeOrder({ orderId: "A", priorityScore: 5 }),
      makeOrder({ orderId: "B", priorityScore: 15 }),
      makeOrder({ orderId: "C", priorityScore: 10 }),
    ]
    const sorted = reorderQueue(orders)
    expect(sorted.map((o) => o.orderId)).toEqual(["B", "C", "A"])
  })

  it("preserves count after reorder (Req 4.5)", () => {
    const orders = [
      makeOrder({ orderId: "A", priorityScore: 5 }),
      makeOrder({ orderId: "B", priorityScore: 15 }),
    ]
    const sorted = reorderQueue(orders)
    expect(sorted).toHaveLength(orders.length)
  })

  it("does not mutate original array", () => {
    const orders = [
      makeOrder({ orderId: "A", priorityScore: 5 }),
      makeOrder({ orderId: "B", priorityScore: 15 }),
    ]
    const original = [...orders]
    reorderQueue(orders)
    expect(orders.map((o) => o.orderId)).toEqual(original.map((o) => o.orderId))
  })

  it("handles empty array", () => {
    expect(reorderQueue([])).toEqual([])
  })
})
