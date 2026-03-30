import type { MenuItemTemplate } from "./types"

const defaultSizes = [
  { label: "ธรรมดา", extraPrice: 0 },
  { label: "พิเศษ", extraPrice: 10 },
]

const defaultAddOns = [
  { name: "ไข่ดาว", price: 10 },
  { name: "ไข่เจียว", price: 15 },
  { name: "หมูกรอบ", price: 20 },
]

const drinkAddOns = [
  { name: "เพิ่มหวาน", price: 0 },
  { name: "ลดหวาน", price: 0 },
  { name: "เพิ่มนม", price: 5 },
  { name: "วิปครีม", price: 10 },
]

export const sampleMenu: MenuItemTemplate[] = [
  { itemId: "m1", name: "ผัดไทย", category: "noodle", unitPrice: 80, costPrice: 35, isAvailable: true, description: "ผัดไทยกุ้งสด ถั่วงอก", sizes: defaultSizes, addOns: [{ name: "กุ้งเพิ่ม", price: 30 }, ...defaultAddOns.slice(0, 1)] },
  { itemId: "m2", name: "ผัดไทยกุ้งสด", category: "noodle", unitPrice: 80, costPrice: 35, isAvailable: true, description: "ผัดไทยกุ้งสด ถั่วงอก", sizes: defaultSizes, addOns: [{ name: "กุ้งเพิ่ม", price: 30 }, ...defaultAddOns.slice(0, 1)] },
  { itemId: "m3", name: "ข้าวผัดกระเพราหมูสับ", category: "rice", unitPrice: 60, costPrice: 25, isAvailable: true, description: "ข้าวสวยราดกระเพราหมูสับ ไข่ดาว", sizes: defaultSizes, addOns: defaultAddOns },
  { itemId: "m4", name: "ข้าวผัดกระเพราไก่", category: "rice", unitPrice: 60, costPrice: 25, isAvailable: true, description: "ข้าวสวยราดกระเพราไก่สับ", sizes: defaultSizes, addOns: defaultAddOns },
  // { itemId: "m3", name: "ข้าวมันไก่", category: "rice", unitPrice: 50, costPrice: 20, isAvailable: true, description: "ข้าวมันไก่ต้ม น้ำจิ้ม", sizes: defaultSizes, addOns: [{ name: "ไก่เพิ่ม", price: 20 }, { name: "น้ำซุป", price: 10 }] },
  // { itemId: "m4", name: "ข้าวหมูแดง", category: "rice", unitPrice: 55, costPrice: 22, isAvailable: true, description: "ข้าวหมูแดงหมูกรอบ", sizes: defaultSizes, addOns: defaultAddOns },
  // { itemId: "m6", name: "ผัดซีอิ๊ว", category: "noodle", unitPrice: 60, costPrice: 25, isAvailable: true, description: "เส้นใหญ่ผัดซีอิ๊ว ไข่", sizes: defaultSizes, addOns: defaultAddOns },
  // { itemId: "m7", name: "ก๋วยเตี๋ยวต้มยำ", category: "noodle", unitPrice: 55, costPrice: 23, isAvailable: true, description: "ก๋วยเตี๋ยวต้มยำหมูสับ", sizes: defaultSizes, addOns: [{ name: "ลูกชิ้น", price: 10 }, { name: "เลือดหมู", price: 10 }] },
  // { itemId: "m8", name: "ต้มยำกุ้ง", category: "soup", unitPrice: 120, costPrice: 60, isAvailable: true, description: "ต้มยำกุ้งน้ำข้น", sizes: [{ label: "เล็ก", extraPrice: 0 }, { label: "ใหญ่", extraPrice: 40 }] },
  // { itemId: "m9", name: "ต้มข่าไก่", category: "soup", unitPrice: 90, costPrice: 40, isAvailable: true, description: "ต้มข่าไก่ กะทิสด", sizes: [{ label: "เล็ก", extraPrice: 0 }, { label: "ใหญ่", extraPrice: 30 }] },
  // { itemId: "m10", name: "ส้มตำไทย", category: "salad", unitPrice: 45, costPrice: 15, isAvailable: true, description: "ส้มตำไทย ถั่วลิสง", addOns: [{ name: "ปูเค็ม", price: 15 }, { name: "กุ้งแห้ง", price: 10 }] },
  // { itemId: "m11", name: "ลาบหมู", category: "salad", unitPrice: 65, costPrice: 28, isAvailable: true, description: "ลาบหมูสับ ข้าวคั่ว", sizes: defaultSizes },
  { itemId: "m12", name: "น้ำเปล่า", category: "drink", unitPrice: 10, costPrice: 3, isAvailable: true, description: "น้ำดื่ม 600ml" },
  { itemId: "m13", name: "ชาเย็น", category: "drink", unitPrice: 35, costPrice: 10, isAvailable: true, description: "ชาไทยเย็น หวานมัน", addOns: drinkAddOns },
  { itemId: "m14", name: "กาแฟเย็น", category: "drink", unitPrice: 40, costPrice: 12, isAvailable: true, description: "กาแฟโบราณเย็น", addOns: drinkAddOns },
  // { itemId: "m15", name: "แกงเขียวหวานไก่", category: "curry", unitPrice: 75, costPrice: 30, isAvailable: false, description: "แกงเขียวหวานไก่ มะเขือ" },
]
