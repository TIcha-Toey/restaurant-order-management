/**
 * Property-based test: Menu availability filter
 * Property 11 — Validates Requirement 6.1
 *
 * Property: getAllMenuItems, getMenuByCategory, searchMenu ต้องคืนเฉพาะเมนูที่ isAvailable = true เสมอ
 * สำหรับทุก input ที่เป็นไปได้ ไม่มีเมนูที่ isAvailable = false หลุดออกมา
 */

import { describe, it, expect } from "vitest"
import fc from "fast-check"
import type { MenuItemTemplate } from "@restaurant/types"
import { MenuManagement } from "../MenuManagement"

/** Arbitrary สำหรับสร้าง MenuItemTemplate แบบสุ่ม */
const menuItemArb: fc.Arbitrary<MenuItemTemplate> = fc.record({
  itemId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  category: fc.constantFrom("rice", "noodle", "soup", "salad", "curry", "drink"),
  unitPrice: fc.nat({ max: 10000 }),
  costPrice: fc.nat({ max: 10000 }),
  isAvailable: fc.boolean(),
  description: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
})

const menuListArb = fc.array(menuItemArb, { maxLength: 50 })

describe("Property 11: Menu availability filter", () => {
  it("getAllMenuItems returns only items where isAvailable = true", () => {
    fc.assert(
      fc.property(menuListArb, (items) => {
        const menu = new MenuManagement(items)
        const result = menu.getAllMenuItems()

        // Every returned item must be available
        expect(result.every((i) => i.isAvailable)).toBe(true)

        // Count must match the number of available items in input
        const expectedCount = items.filter((i) => i.isAvailable).length
        expect(result).toHaveLength(expectedCount)
      })
    )
  })

  it("getMenuByCategory returns only available items in that category", () => {
    fc.assert(
      fc.property(menuListArb, fc.constantFrom("rice", "noodle", "soup", "salad", "curry", "drink"), (items, category) => {
        const menu = new MenuManagement(items)
        const result = menu.getMenuByCategory(category)

        // Every returned item must be available AND in the requested category
        for (const item of result) {
          expect(item.isAvailable).toBe(true)
          expect(item.category).toBe(category)
        }

        // Count must match
        const expectedCount = items.filter((i) => i.isAvailable && i.category === category).length
        expect(result).toHaveLength(expectedCount)
      })
    )
  })

  it("searchMenu returns only available items matching the keyword", () => {
    fc.assert(
      fc.property(menuListArb, fc.string({ minLength: 0, maxLength: 10 }), (items, keyword) => {
        const menu = new MenuManagement(items)
        const result = menu.searchMenu(keyword)

        // Every returned item must be available
        expect(result.every((i) => i.isAvailable)).toBe(true)

        // Every returned item name must contain the keyword (case-insensitive)
        const lower = keyword.toLowerCase()
        for (const item of result) {
          expect(item.name.toLowerCase()).toContain(lower)
        }
      })
    )
  })

  it("no unavailable item ever appears in any query result", () => {
    fc.assert(
      fc.property(menuListArb, (items) => {
        const menu = new MenuManagement(items)
        const unavailableIds = new Set(
          items.filter((i) => !i.isAvailable).map((i) => i.itemId)
        )

        const allResults = menu.getAllMenuItems()
        for (const item of allResults) {
          expect(unavailableIds.has(item.itemId)).toBe(false)
        }
      })
    )
  })

  it("toggling availability is reflected in subsequent queries", () => {
    fc.assert(
      fc.property(
        menuListArb.filter((items) => items.length > 0),
        fc.boolean(),
        (items, newAvailability) => {
          const menu = new MenuManagement(items)
          const target = items[0]

          menu.updateAvailability(target.itemId, newAvailability)

          const result = menu.getAllMenuItems()
          const found = result.find((i) => i.itemId === target.itemId)

          if (newAvailability) {
            expect(found).toBeDefined()
          } else {
            expect(found).toBeUndefined()
          }
        }
      )
    )
  })
})
