import { describe, it, expect } from "vitest"
import {
  calculateItemGP, getLowGPItems, calculateActualSellingPrice,
  analyzeOrderProfit, analyzeChannelProfit, computeChannelRevenue,
} from "../ProfitAnalyzer"
import type { UnifiedOrder, ItemProfitAnalysis, DatePeriod } from "@restaurant/types"

const rates = { grabFood: 0.30, lineMan: 0.30, shopeeFood: 0.25, walkIn: 0, website: 0 } as const

function makeOrder(overrides: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    orderId: "ORD-1", channel: "grabFood",
    items: [{ itemId: "m1", name: "ข้าวผัด", quantity: 2, unitPrice: 100, costPrice: 40 }],
    totalAmount: 200, totalCost: 80, orderTime: Date.now(),
    status: "delivered", priorityScore: 0, enteredBy: "staff1",
    ...overrides,
  }
}

const period: DatePeriod = { startDate: Date.now() - 86400000, endDate: Date.now() + 86400000, periodType: "daily" }

describe("calculateItemGP", () => {
  it("calculates GP% correctly (Req 11.1)", () => {
    const { gpPercentage } = calculateItemGP({ unitPrice: 100, costPrice: 40 })
    expect(gpPercentage).toBeCloseTo(60)
  })

  it("calculates grossProfitPerUnit (Req 11.2)", () => {
    const { grossProfitPerUnit } = calculateItemGP({ unitPrice: 100, costPrice: 40 })
    expect(grossProfitPerUnit).toBe(60)
  })

  it("negative GP when cost > price (Req 11.3)", () => {
    const { gpPercentage } = calculateItemGP({ unitPrice: 50, costPrice: 80 })
    expect(gpPercentage).toBeLessThan(0)
  })

  it("GP <= 100 (Req 11.4)", () => {
    const { gpPercentage } = calculateItemGP({ unitPrice: 100, costPrice: 0 })
    expect(gpPercentage).toBeLessThanOrEqual(100)
  })
})

describe("getLowGPItems", () => {
  it("filters items below threshold (Req 11.6)", () => {
    const items: ItemProfitAnalysis[] = [
      { itemId: "1", name: "A", category: "", unitPrice: 100, costPrice: 40, gpPercentage: 60, grossProfitPerUnit: 60, totalQuantitySold: 0, totalRevenue: 0, totalCost: 0, totalGrossProfit: 0 },
      { itemId: "2", name: "B", category: "", unitPrice: 100, costPrice: 80, gpPercentage: 20, grossProfitPerUnit: 20, totalQuantitySold: 0, totalRevenue: 0, totalCost: 0, totalGrossProfit: 0 },
    ]
    expect(getLowGPItems(items, 50)).toHaveLength(1)
    expect(getLowGPItems(items, 50)[0].name).toBe("B")
  })
})

describe("calculateActualSellingPrice", () => {
  it("decomposes correctly (Req 12.1, 12.2)", () => {
    const actual = calculateActualSellingPrice(1000, 300, 65.42)
    expect(actual + 300 + 65.42).toBeCloseTo(1000)
  })

  it("walkIn no commission no VAT = totalSellingPrice (Req 12.3)", () => {
    expect(calculateActualSellingPrice(1000, 0, 0)).toBe(1000)
  })
})

describe("analyzeOrderProfit", () => {
  it("calculates grossProfit (Req 13.1)", () => {
    const result = analyzeOrderProfit(makeOrder(), 0.30, false)
    expect(result.grossProfit).toBe(120) // 200 - 80
  })

  it("calculates netProfit (Req 13.2)", () => {
    const result = analyzeOrderProfit(makeOrder(), 0.30, false)
    expect(result.netProfit).toBeCloseTo(200 - 60 - 80) // actual - cost
  })

  it("calculates netProfitMargin (Req 13.3)", () => {
    const result = analyzeOrderProfit(makeOrder(), 0.30, false)
    expect(result.netProfitMargin).toBeCloseTo((result.netProfit / 200) * 100)
  })

  it("walkIn has higher actualSellingPrice than grabFood (Req 12.4)", () => {
    const grab = analyzeOrderProfit(makeOrder({ channel: "grabFood" }), 0.30, false)
    const walk = analyzeOrderProfit(makeOrder({ channel: "walkIn" }), 0, false)
    expect(walk.actualSellingPrice).toBeGreaterThanOrEqual(grab.actualSellingPrice)
  })
})

describe("analyzeChannelProfit", () => {
  it("includes only delivered orders (Req 13.4)", () => {
    const orders = [
      makeOrder({ orderId: "1", status: "delivered" }),
      makeOrder({ orderId: "2", status: "preparing" }),
    ]
    const result = analyzeChannelProfit(orders, rates, false, period)
    const grab = result.find((c) => c.channel === "grabFood")
    expect(grab?.totalOrders).toBe(1)
  })
})

describe("computeChannelRevenue", () => {
  it("calculates revenue per channel (Req 10.1, 10.2)", () => {
    const orders = [
      makeOrder({ orderId: "1", channel: "grabFood", totalAmount: 200 }),
      makeOrder({ orderId: "2", channel: "walkIn", totalAmount: 150 }),
    ]
    const result = computeChannelRevenue(orders, rates, period)
    expect(result.channels.length).toBe(2)
    expect(result.totalGrossRevenue).toBe(350)
  })

  it("identifies bestChannel (Req 10.4)", () => {
    const orders = [
      makeOrder({ orderId: "1", channel: "walkIn", totalAmount: 500 }),
      makeOrder({ orderId: "2", channel: "grabFood", totalAmount: 200 }),
    ]
    const result = computeChannelRevenue(orders, rates, period)
    expect(result.bestChannel).toBe("walkIn") // 500 net vs 200*0.7=140 net
  })
})
