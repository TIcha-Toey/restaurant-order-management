import { describe, it, expect } from "vitest"
import { validateDatePeriod, generateTaxReport } from "../TaxReportGenerator"
import type { DatePeriod, IncomeSummary, ExpenseSummary, ProfitLossSummary } from "@restaurant/types"

const period: DatePeriod = { startDate: 1000, endDate: 2000, periodType: "monthly" }

const income: IncomeSummary = {
  period, totalGrossIncome: 10000, totalCommission: 1000,
  totalNetIncome: 9000, totalVAT: 0, byChannel: [], manualIncomeTotal: 0,
}
const expenses: ExpenseSummary = { period, totalExpenses: 5000, totalVATInput: 0, byCategory: [] }
const profitLoss: ProfitLossSummary = {
  period, totalNetIncome: 9000, totalExpenses: 5000,
  grossProfit: 4000, vatPayable: 0, netProfit: 4000,
}

describe("validateDatePeriod", () => {
  it("accepts valid period", () => {
    expect(validateDatePeriod(period).valid).toBe(true)
  })

  it("rejects startDate >= endDate (Req 15.4)", () => {
    const result = validateDatePeriod({ startDate: 2000, endDate: 1000, periodType: "monthly" })
    expect(result.valid).toBe(false)
  })

  it("rejects equal dates (Req 15.4)", () => {
    const result = validateDatePeriod({ startDate: 1000, endDate: 1000, periodType: "monthly" })
    expect(result.valid).toBe(false)
  })
})

describe("generateTaxReport", () => {
  it("generates monthly report (Req 15.1, 15.2)", () => {
    const result = generateTaxReport("monthly", period, income, expenses, profitLoss, null)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.report.type).toBe("monthly")
      expect(result.report.income).toBe(income)
      expect(result.report.expenses).toBe(expenses)
      expect(result.report.profitLoss).toBe(profitLoss)
    }
  })

  it("includes vatSummary when provided (Req 15.5)", () => {
    const vat = { period, vatRate: 0.07, outputVAT: 100, inputVAT: 50, netVAT: 50, isRegistered: true }
    const result = generateTaxReport("vat", period, income, expenses, profitLoss, vat)
    if (result.success) {
      expect(result.report.vatSummary).toBe(vat)
    }
  })

  it("rejects invalid date period (Req 15.4)", () => {
    const bad: DatePeriod = { startDate: 2000, endDate: 1000, periodType: "monthly" }
    const result = generateTaxReport("monthly", bad, income, expenses, profitLoss, null)
    expect(result.success).toBe(false)
  })
})
