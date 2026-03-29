import { describe, it, expect } from "vitest"
import { validateOrder } from "../validateOrder"
import type { MenuItem } from "@restaurant/types"

const validItem: MenuItem = {
  itemId: "m1",
  name: "ข้าวผัดกระเพรา",
  quantity: 2,
  unitPrice: 60,
  costPrice: 25,
}

describe("validateOrder", () => {
  it("returns success for valid input", () => {
    const result = validateOrder({ items: [validItem], enteredBy: "staff1" })
    expect(result.success).toBe(true)
  })

  // Req 2.1 — items ต้องมีอย่างน้อย 1 รายการ
  it("rejects empty items array", () => {
    const result = validateOrder({ items: [], enteredBy: "staff1" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("รายการอาหาร")
    }
  })

  // Req 2.2 — quantity ต้อง > 0
  it("rejects item with quantity = 0", () => {
    const result = validateOrder({
      items: [{ ...validItem, quantity: 0 }],
      enteredBy: "staff1",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("จำนวนสินค้า")
    }
  })

  it("rejects item with negative quantity", () => {
    const result = validateOrder({
      items: [{ ...validItem, quantity: -1 }],
      enteredBy: "staff1",
    })
    expect(result.success).toBe(false)
  })

  // Req 2.3 — enteredBy ต้องไม่ว่าง
  it("rejects empty enteredBy", () => {
    const result = validateOrder({ items: [validItem], enteredBy: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("พนักงาน")
    }
  })

  it("rejects whitespace-only enteredBy", () => {
    const result = validateOrder({ items: [validItem], enteredBy: "   " })
    expect(result.success).toBe(false)
  })

  it("accepts multiple valid items", () => {
    const result = validateOrder({
      items: [validItem, { ...validItem, itemId: "m2", quantity: 3 }],
      enteredBy: "staff1",
    })
    expect(result.success).toBe(true)
  })

  it("rejects if any item has invalid quantity among valid ones", () => {
    const result = validateOrder({
      items: [validItem, { ...validItem, itemId: "m2", quantity: 0 }],
      enteredBy: "staff1",
    })
    expect(result.success).toBe(false)
  })
})
