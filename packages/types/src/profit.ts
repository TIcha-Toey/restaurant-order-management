/**
 * @module profit
 * @description Interfaces สำหรับวิเคราะห์กำไร — GP ต่อเมนู, ต่อออเดอร์, ต่อช่องทาง, รายงานรวม
 */

import type { ChannelSource } from "./enums"
import type { DatePeriod } from "./finance"

/** วิเคราะห์กำไรต่อเมนู */
export interface ItemProfitAnalysis {
  /** รหัสเมนู */
  itemId: string
  /** ชื่อเมนู */
  name: string
  /** หมวดหมู่ */
  category: string
  /** ราคาขาย */
  unitPrice: number
  /** ต้นทุน */
  costPrice: number
  /** GP% = (unitPrice - costPrice) / unitPrice × 100 */
  gpPercentage: number
  /** กำไรขั้นต้นต่อหน่วย = unitPrice - costPrice */
  grossProfitPerUnit: number
  /** จำนวนที่ขายได้ในช่วงเวลา */
  totalQuantitySold: number
  /** ยอดขายรวม = unitPrice × totalQuantitySold */
  totalRevenue: number
  /** ต้นทุนรวม = costPrice × totalQuantitySold */
  totalCost: number
  /** กำไรขั้นต้นรวม = totalRevenue - totalCost */
  totalGrossProfit: number
}

/** วิเคราะห์กำไรต่อออเดอร์ */
export interface OrderProfitAnalysis {
  /** รหัสออเดอร์ */
  orderId: string
  /** ช่องทาง */
  channel: ChannelSource
  /** วิเคราะห์กำไรแต่ละเมนูในออเดอร์ */
  items: ItemProfitAnalysis[]
  /** ราคาขายรวม (ยอดออเดอร์) */
  totalSellingPrice: number
  /** ต้นทุนรวมของออเดอร์ */
  totalCostPrice: number
  /** กำไรขั้นต้น = totalSellingPrice - totalCostPrice */
  grossProfit: number
  /** GP% ของออเดอร์ */
  gpPercentage: number
  /** ค่าคอมมิชชัน (ถ้าเป็น delivery app) */
  commissionAmount: number
  /** VAT (ถ้าจด VAT) */
  vatAmount: number
  /** ราคาขายจริงที่ร้านได้รับ */
  actualSellingPrice: number
  /** กำไรสุทธิ = actualSellingPrice - totalCostPrice */
  netProfit: number
  /** Net Profit Margin % = netProfit / totalSellingPrice × 100 */
  netProfitMargin: number
}

/** วิเคราะห์กำไรแยกตามช่องทาง */
export interface ChannelProfitAnalysis {
  /** ช่องทาง */
  channel: ChannelSource
  /** ช่วงเวลา */
  period: DatePeriod
  /** จำนวนออเดอร์ */
  totalOrders: number
  /** ยอดขายรวม */
  totalSellingPrice: number
  /** ต้นทุนรวม */
  totalCostPrice: number
  /** กำไรขั้นต้นรวม */
  totalGrossProfit: number
  /** GP% เฉลี่ย */
  averageGPPercentage: number
  /** ค่าคอมมิชชันรวม */
  totalCommission: number
  /** VAT รวม */
  totalVAT: number
  /** ราคาขายจริงรวมที่ร้านได้รับ */
  totalActualSellingPrice: number
  /** กำไรสุทธิรวม */
  totalNetProfit: number
  /** Net Profit Margin % */
  netProfitMargin: number
  /** เมนูที่กำไรสูงสุด */
  topProfitItems: ItemProfitAnalysis[]
  /** เมนูที่ GP% ต่ำ (ควรปรับปรุง) */
  lowGPItems: ItemProfitAnalysis[]
}

/** สรุปกำไรแยกตามหมวดหมู่ */
export interface CategoryProfitSummary {
  /** หมวดหมู่ */
  category: string
  /** ยอดขายรวม */
  totalRevenue: number
  /** ต้นทุนรวม */
  totalCost: number
  /** กำไรขั้นต้นรวม */
  totalGrossProfit: number
  /** GP% เฉลี่ย */
  averageGPPercentage: number
  /** จำนวนเมนูในหมวดหมู่ */
  itemCount: number
}

/** สรุปกำไรรวมทั้งหมด */
export interface OverallProfitSummary {
  /** ยอดขายรวม */
  totalSellingPrice: number
  /** ต้นทุนรวม */
  totalCostPrice: number
  /** กำไรขั้นต้นรวม */
  totalGrossProfit: number
  /** GP% รวม */
  overallGPPercentage: number
  /** ค่าคอมมิชชันรวม */
  totalCommission: number
  /** VAT รวม */
  totalVAT: number
  /** ราคาขายจริงรวม */
  totalActualSellingPrice: number
  /** กำไรสุทธิรวม */
  totalNetProfit: number
  /** Net Profit Margin % รวม */
  overallNetProfitMargin: number
  /** ช่องทางที่กำไรสุทธิสูงสุด */
  bestProfitChannel: ChannelSource
  /** เมนูที่ GP% สูงสุด */
  bestGPItem: string
  /** เมนูที่ GP% ต่ำสุด */
  worstGPItem: string
}

/** รายงานวิเคราะห์กำไรรวม */
export interface ProfitAnalysisReport {
  /** ช่วงเวลา */
  period: DatePeriod
  /** วิเคราะห์แยกตามเมนู */
  byItem: ItemProfitAnalysis[]
  /** วิเคราะห์แยกตามหมวดหมู่ */
  byCategory: CategoryProfitSummary[]
  /** วิเคราะห์แยกตามช่องทาง */
  byChannel: ChannelProfitAnalysis[]
  /** สรุปรวมทั้งหมด */
  overall: OverallProfitSummary
}
