/**
 * @module @restaurant/types
 * @description Shared TypeScript types/interfaces สำหรับระบบจัดการออเดอร์ร้านอาหาร
 */

// Type definitions พื้นฐาน — ช่องทาง, สถานะ, ประเภทรายการ
export type {
  ChannelSource,
  OrderStatus,
  TransactionType,
  IncomeSource,
  ExpenseCategoryType,
  TaxReportType,
  ExportFormat,
} from "./enums"

// Interfaces สำหรับออเดอร์ — เมนู, รายละเอียด, ออเดอร์หลัก, เมนูในระบบ
export type {
  MenuItem,
  OrderDetails,
  UnifiedOrder,
  MenuItemTemplate,
} from "./order"

// Interfaces สำหรับสถานะออเดอร์และลำดับความสำคัญ
export type {
  OrderState,
  StateTransition,
  PriorityScore,
  PriorityFactor,
} from "./state"

// Interfaces สำหรับรายรับรายจ่าย
export type {
  IncomeRecord,
  ExpenseRecord,
  ExpenseInput,
  ManualIncomeInput,
  ExpenseFilter,
  DatePeriod,
} from "./finance"

// Interfaces สำหรับรายงาน — สรุปยอดช่องทาง, รายรับรายจ่าย, กำไร/ขาดทุน, VAT
export type {
  ChannelRevenueSummary,
  ChannelComparison,
  IncomeSummary,
  CategoryExpenseSummary,
  ExpenseSummary,
  ProfitLossSummary,
  VATSummary,
} from "./reports"

// Interfaces สำหรับวิเคราะห์กำไร
export type {
  ItemProfitAnalysis,
  OrderProfitAnalysis,
  ChannelProfitAnalysis,
  CategoryProfitSummary,
  OverallProfitSummary,
  ProfitAnalysisReport,
} from "./profit"
