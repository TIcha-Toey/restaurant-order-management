/**
 * @module FinanceEngine
 * @description บันทึกรายรับอัตโนมัติจากออเดอร์ + รายรับด้วยมือ + คำนวณ VAT + กำไร/ขาดทุน
 *
 * Requirements: 7.1-7.6, 8.1-8.4, 14.1-14.3
 */

import type {
  ChannelSource,
  UnifiedOrder,
  IncomeRecord,
  ManualIncomeInput,
  DatePeriod,
  IncomeSummary,
  ExpenseSummary,
  ProfitLossSummary,
  VATSummary,
  ChannelRevenueSummary,
} from "@restaurant/types"

/** อัตราค่าคอมมิชชันเริ่มต้น */
const defaultCommissionRates: Record<ChannelSource, number> = {
  grabFood: 0.30,
  lineMan: 0.30,
  shopeeFood: 0.25,
  walkIn: 0,
  website: 0,
}

let incomeRecords: IncomeRecord[] = []
let recordCounter = 0

function generateRecordId(): string {
  return `INC-${Date.now()}-${++recordCounter}`
}

/**
 * สร้าง IncomeRecord จากออเดอร์ที่ delivered — Req 7.1, 7.2, 7.3, 7.5
 */
export function createIncomeFromOrder(
  order: UnifiedOrder,
  isVATRegistered: boolean,
  commissionRates?: Partial<Record<ChannelSource, number>>,
  recordedBy: string = "system"
): IncomeRecord {
  const rates = { ...defaultCommissionRates, ...commissionRates }
  const grossAmount = order.totalAmount
  const commissionRate = rates[order.channel] ?? 0 // Req 7.5: walkIn/website = 0
  const commissionAmount = grossAmount * commissionRate // Req 7.2
  const netAmount = grossAmount - commissionAmount // Req 7.3
  const vatAmount = isVATRegistered ? grossAmount * 7 / 107 : 0 // Req 8.1, 8.4

  const record: IncomeRecord = {
    recordId: generateRecordId(),
    type: "income",
    source: "order",
    orderId: order.orderId, // Req 7.4
    channel: order.channel, // Req 7.4
    grossAmount,
    commissionRate,
    commissionAmount,
    netAmount,
    vatAmount,
    description: `รายรับจากออเดอร์ ${order.orderId} (${order.channel})`,
    recordedAt: Date.now(),
    recordedBy,
  }

  incomeRecords.push(record)
  return record
}

/**
 * บันทึกรายรับด้วยมือ — Req 7.4 (manual income)
 */
export function recordManualIncome(
  input: ManualIncomeInput,
  isVATRegistered: boolean,
  recordedBy: string
): IncomeRecord {
  const vatAmount = isVATRegistered ? input.amount * 7 / 107 : 0

  const record: IncomeRecord = {
    recordId: generateRecordId(),
    type: "income",
    source: "manual",
    grossAmount: input.amount,
    commissionRate: 0,
    commissionAmount: 0,
    netAmount: input.amount,
    vatAmount,
    description: input.description,
    recordedAt: Date.now(),
    recordedBy,
  }

  incomeRecords.push(record)
  return record
}

/**
 * คำนวณ VAT — Req 8.1, 8.2, 8.3, 8.4
 */
export function computeVAT(
  period: DatePeriod,
  isVATRegistered: boolean,
  expenseTotalVATInput: number
): VATSummary | null {
  if (!isVATRegistered) return null // Req 8.4

  const periodIncomes = incomeRecords.filter(
    (r) => r.recordedAt >= period.startDate && r.recordedAt <= period.endDate
  )

  const outputVAT = periodIncomes.reduce((s, r) => s + r.vatAmount, 0) // Req 8.1
  const inputVAT = expenseTotalVATInput // Req 8.2
  const netVAT = outputVAT - inputVAT // Req 8.3

  return {
    period,
    vatRate: 0.07,
    outputVAT,
    inputVAT,
    netVAT,
    isRegistered: true,
  }
}

/**
 * สรุปรายรับตามช่วงเวลา — Req 14.1
 */
export function getIncomeSummary(period: DatePeriod): IncomeSummary {
  const periodIncomes = incomeRecords.filter(
    (r) => r.recordedAt >= period.startDate && r.recordedAt <= period.endDate
  )

  const orderIncomes = periodIncomes.filter((r) => r.source === "order")
  const manualIncomes = periodIncomes.filter((r) => r.source === "manual")

  const channels: ChannelSource[] = ["grabFood", "lineMan", "shopeeFood", "walkIn", "website"]
  const byChannel: ChannelRevenueSummary[] = channels.map((ch) => {
    const chIncomes = orderIncomes.filter((r) => r.channel === ch)
    const grossRevenue = chIncomes.reduce((s, r) => s + r.grossAmount, 0)
    const totalCommission = chIncomes.reduce((s, r) => s + r.commissionAmount, 0)
    const netRevenue = chIncomes.reduce((s, r) => s + r.netAmount, 0)
    const totalOrders = chIncomes.length
    return {
      channel: ch,
      period,
      totalOrders,
      grossRevenue,
      totalCommission,
      netRevenue,
      averageOrderValue: totalOrders > 0 ? grossRevenue / totalOrders : 0,
    }
  })

  return {
    period,
    totalGrossIncome: periodIncomes.reduce((s, r) => s + r.grossAmount, 0),
    totalCommission: periodIncomes.reduce((s, r) => s + r.commissionAmount, 0),
    totalNetIncome: periodIncomes.reduce((s, r) => s + r.netAmount, 0),
    totalVAT: periodIncomes.reduce((s, r) => s + r.vatAmount, 0),
    byChannel,
    manualIncomeTotal: manualIncomes.reduce((s, r) => s + r.netAmount, 0),
  }
}

/**
 * คำนวณกำไร/ขาดทุน — Req 14.1, 14.2, 14.3
 */
export function computeProfitLoss(
  period: DatePeriod,
  expenseSummary: ExpenseSummary,
  isVATRegistered: boolean
): ProfitLossSummary {
  const income = getIncomeSummary(period)
  const grossProfit = income.totalNetIncome - expenseSummary.totalExpenses // Req 14.1

  const vatSummary = computeVAT(period, isVATRegistered, expenseSummary.totalVATInput)
  const vatPayable = vatSummary && vatSummary.netVAT > 0 ? vatSummary.netVAT : 0 // Req 14.2
  const netProfit = grossProfit - vatPayable // Req 14.3

  return {
    period,
    totalNetIncome: income.totalNetIncome,
    totalExpenses: expenseSummary.totalExpenses,
    grossProfit,
    vatPayable,
    netProfit,
  }
}

export function getIncomeRecords(): IncomeRecord[] {
  return [...incomeRecords]
}

export function clearIncomeRecords(): void {
  incomeRecords = []
  recordCounter = 0
}
