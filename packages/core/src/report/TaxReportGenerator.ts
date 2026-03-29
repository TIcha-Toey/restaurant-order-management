/**
 * @module TaxReportGenerator
 * @description สร้างรายงานภาษี — รายเดือน, รายปี, VAT
 *
 * Requirements: 15.1-15.5
 */

import type {
  DatePeriod, TaxReportType, IncomeSummary, ExpenseSummary,
  ProfitLossSummary, VATSummary,
} from "@restaurant/types"

export interface TaxReport {
  reportId: string
  type: TaxReportType
  period: DatePeriod
  generatedAt: number
  income: IncomeSummary
  expenses: ExpenseSummary
  profitLoss: ProfitLossSummary
  vatSummary: VATSummary | null
}

/**
 * Validate date period — Req 15.4
 */
export function validateDatePeriod(period: DatePeriod): { valid: true } | { valid: false; error: string } {
  if (period.startDate >= period.endDate) {
    return { valid: false, error: "กรุณาเลือกช่วงเวลาที่ถูกต้อง (startDate ต้องน้อยกว่า endDate)" }
  }
  return { valid: true }
}

/**
 * สร้างรายงานภาษี — Req 15.1, 15.2, 15.5
 */
export function generateTaxReport(
  type: TaxReportType,
  period: DatePeriod,
  income: IncomeSummary,
  expenses: ExpenseSummary,
  profitLoss: ProfitLossSummary,
  vatSummary: VATSummary | null
): { success: true; report: TaxReport } | { success: false; error: string } {
  const dateCheck = validateDatePeriod(period)
  if (!dateCheck.valid) return { success: false, error: dateCheck.error }

  const report: TaxReport = {
    reportId: `RPT-${Date.now()}`,
    type,
    period,
    generatedAt: Date.now(),
    income,    // Req 15.5
    expenses,  // Req 15.5
    profitLoss, // Req 15.5
    vatSummary, // Req 15.5 (null ถ้าไม่จด VAT)
  }

  return { success: true, report }
}
