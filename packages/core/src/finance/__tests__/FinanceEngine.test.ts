import { describe, it, expect, beforeEach } from "vitest"
import {
  createIncomeFromOrder,
  recordManualIncome,
  computeVAT,
  getIncomeSummary,
  computeProfitLoss,
  clearIncomeRecords,
} from "../FinanceEngine"
import type { UnifiedOrder, DatePeriod, ExpenseSummary } from "@restaurant/types"

function makeOrder(overrides: Partial<UnifiedOrder> = {}): UnifiedOrder {
  return {
    orderId: "ORD-1", channel: "grabFood",
    items: [{ itemId: "m1", name: "ข้าวผัด", quantity: 2, unitPrice: 60, costPrice: 25 }],
    totalAmount: 120, totalCost: 50, orderTime: Date.now(),
    status: "delivered", priorityScore: 0, enteredBy: "staff1",
    ...overrides,
  }
}

const period: DatePeriod = {
  startDate: Date.now() - 86400000,
  endDate: Date.now() + 86400000,
  periodType: "daily",
}

const emptyExpenseSummary: ExpenseSummary = {
  period, totalExpenses: 0, totalVATInput: 0, byCategory: [],
}

describe("FinanceEngine", () => {
  beforeEach(() => clearIncomeRecords())

  describe("createIncomeFromOrder", () => {
    it("calculates commission for grabFood (Req 7.2)", () => {
      const record = createIncomeFromOrder(makeOrder(), false)
      expect(record.commissionRate).toBe(0.30)
      expect(record.commissionAmount).toBeCloseTo(36) // 120 * 0.30
    })

    it("calculates netAmount (Req 7.3)", () => {
      const record = createIncomeFromOrder(makeOrder(), false)
      expect(record.netAmount).toBeCloseTo(84) // 120 - 36
    })

    it("walkIn has 0 commission (Req 7.5)", () => {
      const record = createIncomeFromOrder(makeOrder({ channel: "walkIn" }), false)
      expect(record.commissionRate).toBe(0)
      expect(record.commissionAmount).toBe(0)
      expect(record.netAmount).toBe(120)
    })

    it("records orderId and channel for order source (Req 7.4)", () => {
      const record = createIncomeFromOrder(makeOrder(), false)
      expect(record.source).toBe("order")
      expect(record.orderId).toBe("ORD-1")
      expect(record.channel).toBe("grabFood")
    })

    it("calculates VAT when registered (Req 8.1)", () => {
      const record = createIncomeFromOrder(makeOrder(), true)
      expect(record.vatAmount).toBeCloseTo(120 * 7 / 107)
    })

    it("VAT is 0 when not registered (Req 8.4)", () => {
      const record = createIncomeFromOrder(makeOrder(), false)
      expect(record.vatAmount).toBe(0)
    })
  })

  describe("recordManualIncome", () => {
    it("creates manual income record", () => {
      const record = recordManualIncome(
        { amount: 500, description: "ขายน้ำแข็ง", date: Date.now() },
        false, "owner"
      )
      expect(record.source).toBe("manual")
      expect(record.grossAmount).toBe(500)
      expect(record.commissionRate).toBe(0)
    })
  })

  describe("computeVAT", () => {
    it("returns null when not registered (Req 8.4)", () => {
      expect(computeVAT(period, false, 0)).toBeNull()
    })

    it("calculates netVAT = outputVAT - inputVAT (Req 8.3)", () => {
      createIncomeFromOrder(makeOrder(), true)
      const vat = computeVAT(period, true, 50)
      expect(vat).not.toBeNull()
      if (vat) {
        expect(vat.outputVAT).toBeCloseTo(120 * 7 / 107)
        expect(vat.inputVAT).toBe(50)
        expect(vat.netVAT).toBeCloseTo(vat.outputVAT - 50)
      }
    })
  })

  describe("computeProfitLoss", () => {
    it("calculates grossProfit = totalNetIncome - totalExpenses (Req 14.1)", () => {
      createIncomeFromOrder(makeOrder({ channel: "walkIn" }), false)
      const result = computeProfitLoss(period, { ...emptyExpenseSummary, totalExpenses: 30 }, false)
      expect(result.grossProfit).toBeCloseTo(120 - 30)
    })

    it("deducts vatPayable from netProfit (Req 14.3)", () => {
      createIncomeFromOrder(makeOrder({ channel: "walkIn" }), true)
      const result = computeProfitLoss(period, emptyExpenseSummary, true)
      expect(result.vatPayable).toBeGreaterThan(0)
      expect(result.netProfit).toBeLessThan(result.grossProfit)
    })
  })
})
