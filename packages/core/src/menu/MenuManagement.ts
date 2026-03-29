/**
 * @module MenuManagement
 * @description จัดการข้อมูลเมนูอาหาร — ค้นหา, กรอง, เปิด/ปิดการขาย
 *
 * Requirements: 6.1, 6.2, 6.3, 1.2
 */

import type { MenuItemTemplate } from "@restaurant/types"

export class MenuManagement {
  private items: MenuItemTemplate[]

  constructor(items: MenuItemTemplate[] = []) {
    this.items = [...items]
  }

  /** ดึงเมนูทั้งหมดที่พร้อมขาย (isAvailable = true) — Req 6.1 */
  getAllMenuItems(): MenuItemTemplate[] {
    return this.items.filter((item) => item.isAvailable)
  }

  /** ดึงเมนูตามหมวดหมู่ (เฉพาะที่พร้อมขาย) — Req 6.1 */
  getMenuByCategory(category: string): MenuItemTemplate[] {
    return this.items.filter(
      (item) => item.isAvailable && item.category === category
    )
  }

  /** ค้นหาเมนูด้วย keyword (case-insensitive, match ชื่อ, เฉพาะที่พร้อมขาย) — Req 6.2 */
  searchMenu(keyword: string): MenuItemTemplate[] {
    const lower = keyword.toLowerCase()
    return this.items.filter(
      (item) => item.isAvailable && item.name.toLowerCase().includes(lower)
    )
  }

  /** เช็คว่าเมนูพร้อมขายหรือไม่ — Req 6.3 */
  getItemAvailability(itemId: string): boolean {
    const item = this.items.find((i) => i.itemId === itemId)
    return item?.isAvailable ?? false
  }

  /** เปิด/ปิดการขายเมนู — Req 6.3 */
  updateAvailability(itemId: string, available: boolean): void {
    const item = this.items.find((i) => i.itemId === itemId)
    if (item) {
      item.isAvailable = available
    }
  }
}
