/**
 * @module enums
 * @description Type definitions พื้นฐานของระบบ — ช่องทาง, สถานะ, ประเภทรายการ
 */

/** ช่องทางที่ออเดอร์มาจาก */
export type ChannelSource = "grabFood" | "lineMan" | "shopeeFood" | "walkIn" | "website"

/** สถานะของออเดอร์ */
export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "pickedUp" | "delivered" | "cancelled"

/** ประเภทรายการทางการเงิน */
export type TransactionType = "income" | "expense"

/** แหล่งที่มาของรายรับ — order = จากออเดอร์อัตโนมัติ, manual = กรอกเอง */
export type IncomeSource = "order" | "manual"

/** หมวดหมู่รายจ่าย */
export type ExpenseCategoryType =
  | "ingredients"      // วัตถุดิบ
  | "rent"             // ค่าเช่า
  | "utilities"        // ค่าน้ำ ค่าไฟ
  | "staffWages"       // ค่าแรงพนักงาน
  | "equipment"        // อุปกรณ์
  | "marketing"        // การตลาด
  | "packaging"        // บรรจุภัณฑ์
  | "delivery"         // ค่าจัดส่ง
  | "maintenance"      // ซ่อมบำรุง
  | "other"            // อื่นๆ

/** ประเภทรายงานภาษี */
export type TaxReportType =
  | "monthly"           // รายงานรายเดือน
  | "yearly"            // รายงานรายปี (สำหรับ ภ.ง.ด.)
  | "vat"               // รายงาน VAT (ภ.พ.30)

/** รูปแบบไฟล์ที่ export */
export type ExportFormat = "pdf" | "csv" | "xlsx"
