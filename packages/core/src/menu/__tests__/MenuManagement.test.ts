import { describe, it, expect, beforeEach } from "vitest"
import type { MenuItemTemplate } from "@restaurant/types"
import { MenuManagement } from "../MenuManagement"

const sampleMenu: MenuItemTemplate[] = [
  {
    itemId: "m1",
    name: "ข้าวผัดกระเพรา",
    category: "rice",
    unitPrice: 60,
    costPrice: 25,
    isAvailable: true,
  },
  {
    itemId: "m2",
    name: "ผัดไทย",
    category: "noodle",
    unitPrice: 70,
    costPrice: 30,
    isAvailable: true,
  },
  {
    itemId: "m3",
    name: "ต้มยำกุ้ง",
    category: "soup",
    unitPrice: 120,
    costPrice: 60,
    isAvailable: false,
  },
  {
    itemId: "m4",
    name: "ข้าวมันไก่",
    category: "rice",
    unitPrice: 50,
    costPrice: 20,
    isAvailable: true,
  },
  {
    itemId: "m5",
    name: "ส้มตำ",
    category: "salad",
    unitPrice: 45,
    costPrice: 15,
    isAvailable: false,
  },
]

describe("MenuManagement", () => {
  let menu: MenuManagement

  beforeEach(() => {
    menu = new MenuManagement(sampleMenu)
  })

  describe("getAllMenuItems", () => {
    it("returns only available items", () => {
      const items = menu.getAllMenuItems()
      expect(items).toHaveLength(3)
      expect(items.every((i) => i.isAvailable)).toBe(true)
    })

    it("returns empty array when no items are available", () => {
      const emptyMenu = new MenuManagement([
        { ...sampleMenu[2] }, // unavailable
      ])
      expect(emptyMenu.getAllMenuItems()).toHaveLength(0)
    })

    it("returns empty array when constructed with no items", () => {
      const emptyMenu = new MenuManagement()
      expect(emptyMenu.getAllMenuItems()).toHaveLength(0)
    })
  })

  describe("getMenuByCategory", () => {
    it("returns available items in the given category", () => {
      const rice = menu.getMenuByCategory("rice")
      expect(rice).toHaveLength(2)
      expect(rice.every((i) => i.category === "rice")).toBe(true)
    })

    it("excludes unavailable items from category results", () => {
      const soup = menu.getMenuByCategory("soup")
      expect(soup).toHaveLength(0) // ต้มยำกุ้ง is unavailable
    })

    it("returns empty array for non-existent category", () => {
      expect(menu.getMenuByCategory("dessert")).toHaveLength(0)
    })
  })

  describe("searchMenu", () => {
    it("finds items by keyword (case-insensitive)", () => {
      const results = menu.searchMenu("ข้าว")
      expect(results).toHaveLength(2)
      expect(results.map((i) => i.itemId)).toEqual(
        expect.arrayContaining(["m1", "m4"])
      )
    })

    it("excludes unavailable items from search results", () => {
      const results = menu.searchMenu("ต้มยำ")
      expect(results).toHaveLength(0) // ต้มยำกุ้ง is unavailable
    })

    it("returns empty array when no match", () => {
      expect(menu.searchMenu("pizza")).toHaveLength(0)
    })

    it("matches case-insensitively for latin characters", () => {
      const latinMenu = new MenuManagement([
        {
          itemId: "l1",
          name: "Green Curry",
          category: "curry",
          unitPrice: 80,
          costPrice: 35,
          isAvailable: true,
        },
      ])
      expect(latinMenu.searchMenu("green curry")).toHaveLength(1)
      expect(latinMenu.searchMenu("GREEN CURRY")).toHaveLength(1)
    })

    it("returns all available items when keyword is empty string", () => {
      const results = menu.searchMenu("")
      expect(results).toHaveLength(3) // all available items match empty string
    })
  })

  describe("getItemAvailability", () => {
    it("returns true for available item", () => {
      expect(menu.getItemAvailability("m1")).toBe(true)
    })

    it("returns false for unavailable item", () => {
      expect(menu.getItemAvailability("m3")).toBe(false)
    })

    it("returns false for non-existent item", () => {
      expect(menu.getItemAvailability("nonexistent")).toBe(false)
    })
  })

  describe("updateAvailability", () => {
    it("can disable an available item", () => {
      menu.updateAvailability("m1", false)
      expect(menu.getItemAvailability("m1")).toBe(false)
      expect(menu.getAllMenuItems()).toHaveLength(2)
    })

    it("can enable an unavailable item", () => {
      menu.updateAvailability("m3", true)
      expect(menu.getItemAvailability("m3")).toBe(true)
      expect(menu.getAllMenuItems()).toHaveLength(4)
    })

    it("does nothing for non-existent item", () => {
      const before = menu.getAllMenuItems().length
      menu.updateAvailability("nonexistent", false)
      expect(menu.getAllMenuItems()).toHaveLength(before)
    })

    it("toggling availability reflects in search results", () => {
      // ต้มยำกุ้ง is unavailable, enable it
      menu.updateAvailability("m3", true)
      const results = menu.searchMenu("ต้มยำ")
      expect(results).toHaveLength(1)
      expect(results[0].itemId).toBe("m3")
    })
  })
})
