import { describe, it, expect, beforeEach } from "vitest"
import {
  validateExpense,
  createExpenseRecord,
  listExpenses,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  clearExpenses,
} from "../ExpenseManager"
import type { ExpenseInput, DatePeriod } from "@restaurant/types"

const validInput: ExpenseInput = {
  category: "ingredients",
  amount: 500,
  description: "ซื้อผัก",
  date: Date.now(),
  isRecurring: false,
}

const period: DatePeriod = {
  startDate: Date.now() - 86400000,
  endDate: Date.now() + 86400000,
  periodType: "daily",
}

describe("ExpenseManager", () => {
  beforeEach(() => clearExpenses())

  describe("validateExpense", () => {
    it("accepts valid input", () => {
      expect(validateExpense(validInput).success).toBe(true)
    })

    it("rejects amount <= 0 (Req 9.2)", () => {
      const result = validateExpense({ ...validInput, amount: 0 })
      expect(result.success).toBe(false)
    })

    it("rejects empty description (Req 9.3)", () => {
      const result = validateExpense({ ...validInput, description: "" })
      expect(result.success).toBe(false)
    })
  })

  describe("createExpenseRecord", () => {
    it("creates record with correct category (Req 9.4)", () => {
      const result = createExpenseRecord(validInput, false, "owner")
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.record.category).toBe("ingredients")
      }
    })

    it("calculates VAT when registered", () => {
      const result = createExpenseRecord(validInput, true, "owner")
      if (result.success) {
        expect(result.record.vatAmount).toBeCloseTo(500 * 0.07)
      }
    })

    it("VAT is 0 when not registered", () => {
      const result = createExpenseRecord(validInput, false, "owner")
      if (result.success) {
        expect(result.record.vatAmount).toBe(0)
      }
    })
  })

  describe("listExpenses", () => {
    it("returns all expenses when no filter", () => {
      createExpenseRecord(validInput, false, "owner")
      createExpenseRecord({ ...validInput, category: "rent", amount: 10000 }, false, "owner")
      expect(listExpenses()).toHaveLength(2)
    })

    it("filters by category", () => {
      createExpenseRecord(validInput, false, "owner")
      createExpenseRecord({ ...validInput, category: "rent", amount: 10000 }, false, "owner")
      expect(listExpenses({ category: "rent" })).toHaveLength(1)
    })
  })

  describe("updateExpense", () => {
    it("updates amount (Req 9.6)", () => {
      const r = createExpenseRecord(validInput, false, "owner")
      if (!r.success) throw new Error("should succeed")
      const updated = updateExpense(r.record.recordId, { amount: 600 })
      expect(updated.success).toBe(true)
      if (updated.success) expect(updated.record.amount).toBe(600)
    })

    it("rejects invalid amount", () => {
      const r = createExpenseRecord(validInput, false, "owner")
      if (!r.success) throw new Error("should succeed")
      const updated = updateExpense(r.record.recordId, { amount: -1 })
      expect(updated.success).toBe(false)
    })
  })

  describe("deleteExpense", () => {
    it("deletes expense (Req 9.6)", () => {
      const r = createExpenseRecord(validInput, false, "owner")
      if (!r.success) throw new Error("should succeed")
      expect(deleteExpense(r.record.recordId).success).toBe(true)
      expect(listExpenses()).toHaveLength(0)
    })

    it("rejects non-existent expense", () => {
      expect(deleteExpense("nonexistent").success).toBe(false)
    })
  })

  describe("getExpenseSummary", () => {
    it("summarizes expenses by category", () => {
      createExpenseRecord(validInput, false, "owner")
      createExpenseRecord({ ...validInput, category: "rent", amount: 10000 }, false, "owner")
      const summary = getExpenseSummary(period)
      expect(summary.totalExpenses).toBe(10500)
      expect(summary.byCategory).toHaveLength(2)
    })
  })
})
