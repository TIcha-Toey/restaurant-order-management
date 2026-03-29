/**
 * @module finance
 * @description Interfaces สำหรับรายรับรายจ่าย — บันทึก, input, filter, ช่วงเวลา
 */

import type { ChannelSource, ExpenseCategoryType, IncomeSource } from "./enums"

/** บันทึกรายรับ */
export interface IncomeRecord {
  /** รหัสบันทึก */
  recordId: string
  /** ประเภท — เป็น income เสมอ */
  type: "income"
  /** แหล่งที่มา — order (อัตโนมัติ) หรือ manual (กรอกเอง) */
  source: IncomeSource
  /** รหัสออเดอร์ (ถ้ามาจากออเดอร์) */
  orderId?: string
  /** ช่องทางที่ขาย */
  channel?: ChannelSource
  /** ยอดรวมก่อนหักค่าคอมมิชชัน */
  grossAmount: number
  /** อัตราค่าคอมมิชชัน (0-1) เช่น 0.30 = 30% */
  commissionRate: number
  /** จำนวนเงินค่าคอมมิชชัน */
  commissionAmount: number
  /** ยอดสุทธิหลังหักค่าคอมมิชชัน */
  netAmount: number
  /** จำนวน VAT (0 ถ้าไม่ได้จด VAT) */
  vatAmount: number
  /** รายละเอียด */
  description: string
  /** Unix timestamp ที่บันทึก */
  recordedAt: number
  /** พนักงานที่บันทึก */
  recordedBy: string
}

/** บันทึกรายจ่าย */
export interface ExpenseRecord {
  /** รหัสบันทึก */
  recordId: string
  /** ประเภท — เป็น expense เสมอ */
  type: "expense"
  /** หมวดหมู่รายจ่าย */
  category: ExpenseCategoryType
  /** จำนวนเงิน (ต้อง > 0) */
  amount: number
  /** VAT ที่จ่ายไป (ใช้เป็น VAT ซื้อ) */
  vatAmount: number
  /** รายละเอียด */
  description: string
  /** วันที่เกิดรายจ่าย */
  date: number
  /** URL ใบเสร็จ/หลักฐาน (ถ้ามี) */
  receiptUrl?: string
  /** ชื่อร้านค้า/ผู้ขาย */
  vendor?: string
  /** เป็นรายจ่ายประจำหรือไม่ (เช่น ค่าเช่ารายเดือน) */
  isRecurring: boolean
  /** Unix timestamp ที่บันทึก */
  recordedAt: number
  /** พนักงานที่บันทึก */
  recordedBy: string
}

/** ข้อมูลสำหรับบันทึกรายจ่าย */
export interface ExpenseInput {
  /** หมวดหมู่ */
  category: ExpenseCategoryType
  /** จำนวนเงิน */
  amount: number
  /** รายละเอียด */
  description: string
  /** วันที่เกิดรายจ่าย */
  date: number
  /** URL ใบเสร็จ/หลักฐาน (ถ้ามี) */
  receiptUrl?: string
  /** ชื่อร้านค้า/ผู้ขาย */
  vendor?: string
  /** เป็นรายจ่ายประจำหรือไม่ */
  isRecurring: boolean
}

/** ข้อมูลสำหรับบันทึกรายรับด้วยมือ */
export interface ManualIncomeInput {
  /** จำนวนเงิน */
  amount: number
  /** รายละเอียด */
  description: string
  /** วันที่เกิดรายรับ */
  date: number
  /** URL หลักฐาน (ถ้ามี) */
  receiptUrl?: string
}

/** ตัวกรองรายจ่าย */
export interface ExpenseFilter {
  /** หมวดหมู่ */
  category?: ExpenseCategoryType
  /** วันที่เริ่มต้น */
  startDate?: number
  /** วันที่สิ้นสุด */
  endDate?: number
  /** จำนวนเงินขั้นต่ำ */
  minAmount?: number
  /** จำนวนเงินสูงสุด */
  maxAmount?: number
  /** ชื่อร้านค้า/ผู้ขาย */
  vendor?: string
  /** เป็นรายจ่ายประจำหรือไม่ */
  isRecurring?: boolean
}

/** ช่วงเวลาสำหรับรายงาน */
export interface DatePeriod {
  /** Unix timestamp เริ่มต้น */
  startDate: number
  /** Unix timestamp สิ้นสุด */
  endDate: number
  /** ประเภทช่วงเวลา */
  periodType: "daily" | "weekly" | "monthly" | "yearly"
}
