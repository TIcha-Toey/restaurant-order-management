/**
 * @module order
 * @description Interfaces สำหรับออเดอร์ — เมนู, รายละเอียด, ออเดอร์หลัก, เมนูในระบบ
 */

import type { ChannelSource, OrderStatus } from "./enums"

/** รายการอาหารในออเดอร์ */
export interface MenuItem {
  /** รหัสเมนู */
  itemId: string
  /** ชื่อเมนู */
  name: string
  /** จำนวน (ต้อง > 0) */
  quantity: number
  /** ราคาขายต่อหน่วย (ต้อง >= 0) */
  unitPrice: number
  /** ต้นทุนต่อหน่วย (ต้อง >= 0) */
  costPrice: number
  /** หมายเหตุพิเศษ เช่น "เผ็ดมาก" */
  specialInstructions?: string
}

/** รายละเอียดเพิ่มเติมที่พนักงานกรอก */
export interface OrderDetails {
  /** ชื่อลูกค้า */
  customerName?: string
  /** เบอร์โทรลูกค้า */
  customerPhone?: string
  /** ที่อยู่จัดส่ง */
  deliveryAddress?: string
  /** เลขออเดอร์จาก app ต้นทาง เช่น "GRAB-ABC123" */
  externalOrderId?: string
  /** หมายเหตุเพิ่มเติม */
  notes?: string
}

/** ออเดอร์หลักของระบบ */
export interface UnifiedOrder {
  /** รหัสออเดอร์ — ระบบสร้างให้อัตโนมัติ */
  orderId: string
  /** ช่องทาง (พนักงานเลือก) */
  channel: ChannelSource
  /** เลขออเดอร์จาก app (ถ้ามี) */
  externalOrderId?: string
  /** รายการอาหาร (ต้องมีอย่างน้อย 1 รายการ) */
  items: MenuItem[]
  /** ยอดรวมราคาขาย (คำนวณอัตโนมัติจาก items) */
  totalAmount: number
  /** ต้นทุนรวม (คำนวณอัตโนมัติจาก items) */
  totalCost: number
  /** ชื่อลูกค้า */
  customerName?: string
  /** เบอร์โทรลูกค้า */
  customerPhone?: string
  /** ที่อยู่จัดส่ง */
  deliveryAddress?: string
  /** Unix timestamp ตอนสร้างออเดอร์ */
  orderTime: number
  /** เวลาที่คาดว่าจะมารับ */
  estimatedPickupTime?: number
  /** สถานะปัจจุบัน */
  status: OrderStatus
  /** คะแนนความสำคัญ */
  priorityScore: number
  /** หมายเหตุ */
  notes?: string
  /** พนักงานที่กรอกออเดอร์ (ต้องไม่ว่าง) */
  enteredBy: string
}

/** เมนูในระบบ (template สำหรับเลือก) */
export interface MenuItemTemplate {
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
  /** พร้อมขายหรือไม่ */
  isAvailable: boolean
  /** คำอธิบายเมนู */
  description?: string
}
