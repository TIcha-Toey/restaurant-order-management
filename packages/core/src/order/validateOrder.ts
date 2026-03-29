/**
 * @module validateOrder
 * @description ตรวจสอบข้อมูลออเดอร์ก่อนบันทึก
 *
 * Requirements: 2.1, 2.2, 2.3
 */

import type { MenuItem } from "@restaurant/types"

export interface OrderInput {
  items: MenuItem[]
  enteredBy: string
}

export type ValidationResult =
  | { success: true; order: OrderInput }
  | { success: false; error: string }

/**
 * ตรวจสอบข้อมูลออเดอร์
 * - items ต้องมีอย่างน้อย 1 รายการ (Req 2.1)
 * - quantity ของทุก item ต้อง > 0 (Req 2.2)
 * - enteredBy ต้องไม่ว่าง (Req 2.3)
 */
export function validateOrder(input: OrderInput): ValidationResult {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "ต้องมีรายการอาหารอย่างน้อย 1 รายการ" }
  }

  for (const item of input.items) {
    if (item.quantity <= 0) {
      return { success: false, error: "จำนวนสินค้าต้องมากกว่า 0" }
    }
  }

  if (!input.enteredBy || input.enteredBy.trim() === "") {
    return { success: false, error: "ต้องระบุพนักงานที่กรอกออเดอร์" }
  }

  return { success: true, order: input }
}
