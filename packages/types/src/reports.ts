/**
 * @module reports
 * @description Interfaces สำหรับรายงาน — สรุปยอดช่องทาง, รายรับรายจ่าย, กำไร/ขาดทุน, VAT
 */

import type { ChannelSource, ExpenseCategoryType } from "./enums"
import type { DatePeriod } from "./finance"

/** สรุปยอดรายรับแยกตามช่องทาง */
export interface ChannelRevenueSummary {
  /** ช่องทาง */
  channel: ChannelSource
  /** ช่วงเวลา */
  period: DatePeriod
  /** จำนวนออเดอร์ */
  totalOrders: number
  /** ยอดรวมก่อนหักค่าคอมมิชชัน */
  grossRevenue: number
  /** ค่าคอมมิชชันรวม */
  totalCommission: number
  /** ยอดสุทธิหลังหักค่าคอมมิชชัน */
  netRevenue: number
  /** ยอดเฉลี่ยต่อออเดอร์ */
  averageOrderValue: number
}

/** เปรียบเทียบระหว่างช่องทาง */
export interface ChannelComparison {
  /** ช่วงเวลา */
  period: DatePeriod
  /** สรุปยอดแต่ละช่องทาง */
  channels: ChannelRevenueSummary[]
  /** ช่องทางที่ยอดสุทธิสูงสุด */
  bestChannel: ChannelSource
  /** ยอดรวมก่อนหักค่าคอมมิชชันทุกช่องทาง */
  totalGrossRevenue: number
  /** ยอดสุทธิรวมทุกช่องทาง */
  totalNetRevenue: number
  /** ค่าคอมมิชชันรวมทุกช่องทาง */
  totalCommissionPaid: number
}

/** สรุปรายรับ */
export interface IncomeSummary {
  /** ช่วงเวลา */
  period: DatePeriod
  /** รายรับรวมก่อนหักค่าคอมมิชชัน */
  totalGrossIncome: number
  /** ค่าคอมมิชชันรวม */
  totalCommission: number
  /** รายรับสุทธิ */
  totalNetIncome: number
  /** VAT ขายรวม */
  totalVAT: number
  /** สรุปแยกตามช่องทาง */
  byChannel: ChannelRevenueSummary[]
  /** รายรับจากการกรอกมือรวม */
  manualIncomeTotal: number
}

/** สรุปรายจ่ายแยกตามหมวดหมู่ */
export interface CategoryExpenseSummary {
  /** หมวดหมู่ */
  category: ExpenseCategoryType
  /** ชื่อแสดงผลภาษาไทย */
  label: string
  /** ยอดรวม */
  totalAmount: number
  /** จำนวนรายการ */
  transactionCount: number
  /** สัดส่วนของรายจ่ายทั้งหมด (0-100) */
  percentage: number
}

/** สรุปรายจ่าย */
export interface ExpenseSummary {
  /** ช่วงเวลา */
  period: DatePeriod
  /** รายจ่ายรวม */
  totalExpenses: number
  /** VAT ซื้อรวม */
  totalVATInput: number
  /** สรุปแยกตามหมวดหมู่ */
  byCategory: CategoryExpenseSummary[]
}

/** สรุปกำไร/ขาดทุน */
export interface ProfitLossSummary {
  /** ช่วงเวลา */
  period: DatePeriod
  /** รายรับสุทธิ (หลังหักค่าคอมมิชชัน) */
  totalNetIncome: number
  /** รายจ่ายรวม */
  totalExpenses: number
  /** กำไรขั้นต้น = รายรับสุทธิ - รายจ่าย */
  grossProfit: number
  /** VAT ที่ต้องจ่าย = VAT ขาย - VAT ซื้อ (ถ้าจด VAT) */
  vatPayable: number
  /** กำไรสุทธิ */
  netProfit: number
}

/** สรุป VAT */
export interface VATSummary {
  /** ช่วงเวลา */
  period: DatePeriod
  /** อัตรา VAT (0.07 = 7%) */
  vatRate: number
  /** VAT ขาย (จากรายรับ) */
  outputVAT: number
  /** VAT ซื้อ (จากรายจ่าย) */
  inputVAT: number
  /** VAT ที่ต้องนำส่ง = outputVAT - inputVAT */
  netVAT: number
  /** ร้านจด VAT หรือไม่ */
  isRegistered: boolean
}
