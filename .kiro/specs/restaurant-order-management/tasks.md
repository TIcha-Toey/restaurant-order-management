# Implementation Plan: ระบบจัดการออเดอร์ร้านอาหาร (Restaurant Order Management)

## Overview

แผนการพัฒนาแบ่งเป็น 5 Sprint (Sprint ละ 2 สัปดาห์) จัดกลุ่มตาม feature area
เริ่มจากระบบออเดอร์พื้นฐาน → ระบบจัดการออเดอร์ → ระบบการเงิน → ระบบวิเคราะห์กำไร → รายงานและ Dashboard

---

## Sprint 1 (สัปดาห์ 1-2): ระบบออเดอร์พื้นฐาน

เป้าหมาย: สร้าง Data Models, Order Entry UI, Order Aggregator, Validation, Menu Management — ให้พนักงานสร้างออเดอร์ได้

### Data Models & Core Types

- [x] 1. สร้าง Data Models และ Core Types ทั้งหมด
  - [x] 1.1 สร้าง type definitions สำหรับ ChannelSource, OrderStatus, TransactionType, IncomeSource, ExpenseCategoryType, TaxReportType, ExportFormat
    - สร้างไฟล์ types ที่รวม type/enum ทั้งหมดของระบบ
    - _Requirements: 1.1, 5.1, 9.4, 15.2_
  - [x] 1.2 สร้าง interfaces สำหรับ MenuItem, OrderDetails, UnifiedOrder, MenuItemTemplate
    - กำหนด interface ตาม design document พร้อม validation rules ใน comments
    - _Requirements: 1.2, 1.3, 2.5, 2.6, 6.1_
  - [x] 1.3 สร้าง interfaces สำหรับ OrderState, StateTransition, PriorityScore, PriorityFactor
    - _Requirements: 4.1, 5.1, 5.3_
  - [x] 1.4 สร้าง interfaces สำหรับ IncomeRecord, ExpenseRecord, ExpenseInput, ManualIncomeInput, ExpenseFilter, DatePeriod
    - _Requirements: 7.1, 7.4, 9.1, 9.4, 9.5_
  - [x] 1.5 สร้าง interfaces สำหรับ ChannelRevenueSummary, ChannelComparison, IncomeSummary, ExpenseSummary, ProfitLossSummary, VATSummary
    - _Requirements: 10.1, 10.2, 14.1, 8.1_
  - [x] 1.6 สร้าง interfaces สำหรับ ItemProfitAnalysis, OrderProfitAnalysis, ChannelProfitAnalysis, ProfitAnalysisReport, OverallProfitSummary
    - _Requirements: 11.1, 12.1, 13.1, 13.6_

### Menu Management

- [x] 2. Implement ระบบจัดการเมนู (Menu Management)
  - [x] 2.1 Implement MenuManagement — getAllMenuItems, getMenuByCategory, searchMenu, getItemAvailability, updateAvailability
    - แสดงเฉพาะเมนูที่ isAvailable = true, รองรับค้นหาด้วย keyword
    - _Requirements: 6.1, 6.2, 6.3, 1.2_
  - [x] 2.2 Write property test สำหรับ Menu availability filter
    - **Property 11: Menu availability filter**
    - **Validates: Requirement 6.1**
  - [ ]* 2.3 Write property test สำหรับ Menu search relevance
    - **Property 12: Menu search relevance**
    - **Validates: Requirement 6.2**

### Order Validation & Aggregator

- [x] 3. Implement Order Validation และ Order Aggregator
  - [x] 3.1 Implement validateOrder function — ตรวจสอบ items ไม่ว่าง, quantity > 0, enteredBy ไม่ว่าง
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 3.2 Implement buildOrder function — สร้าง UnifiedOrder จาก input, คำนวณ totalAmount และ totalCost อัตโนมัติ, กำหนด status = "received"
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  - [x] 3.3 Implement OrderAggregator — submitOrder (validate + สร้าง orderId + บันทึก DB), getOrder, listOrders, cancelOrder
    - รวมการตรวจสอบ duplicate order (externalOrderId + channel)
    - _Requirements: 2.4, 3.1, 3.2_
  - [ ]* 3.4 Write property test สำหรับ Order totals consistency
    - **Property 1: Order totals consistency**
    - **Validates: Requirements 2.5, 2.6**
  - [ ]* 3.5 Write property test สำหรับ New order initial state
    - **Property 2: New order initial state**
    - **Validates: Requirements 2.7, 2.4**
  - [ ]* 3.6 Write property test สำหรับ Order validation rejects invalid input
    - **Property 3: Order validation rejects invalid input**
    - **Validates: Requirements 2.1, 2.2, 2.3**
  - [ ]* 3.7 Write property test สำหรับ Duplicate order detection
    - **Property 4: Duplicate order detection**
    - **Validates: Requirement 3.2**

### Order Entry UI

- [x] 4. Implement Order Entry UI
  - [x] 4.1 สร้างหน้าจอเลือกช่องทาง (Channel Selector) — แสดง 5 ช่องทาง, ปิดปุ่มเมนูและยืนยันจนกว่าจะเลือกช่องทาง
    - _Requirements: 1.1, 1.5_
  - [x] 4.2 สร้างหน้าจอเลือกเมนู (Menu Selector) — ดึงเมนูจาก MenuManagement, รองรับค้นหา, เพิ่ม/ลบเมนูในออเดอร์
    - _Requirements: 1.2, 6.1, 6.2_
  - [x] 4.3 สร้างฟอร์มกรอกรายละเอียดออเดอร์ (Order Details) — จำนวน, หมายเหตุ, ชื่อลูกค้า, externalOrderId
    - _Requirements: 1.3_
  - [x] 4.4 Implement ปุ่มยืนยันออเดอร์ — disable หลังกด (ป้องกัน double-submit), ส่งข้อมูลไป OrderAggregator, ล้างฟอร์มเมื่อสำเร็จ
    - ตรวจสอบ availability ของเมนูอีกครั้งก่อน submit
    - _Requirements: 1.3, 1.4, 3.1, 6.3_

- [ ] 5. Checkpoint — Sprint 1
  - ตรวจสอบว่าสร้างออเดอร์ได้ครบ flow, validation ทำงานถูกต้อง, เมนูค้นหาได้
  - Ensure all tests pass, ask the user if questions arise.

---

## Sprint 2 (สัปดาห์ 3-4): ระบบจัดการออเดอร์

เป้าหมาย: State Machine, Priority Engine, Kitchen Display System (KDS), Notifications — ให้ครัวเห็นออเดอร์และอัปเดตสถานะได้

### Priority Engine

- [x] 6. Implement Priority Engine
  - [x] 6.1 Implement computePriorityScore — คำนวณจาก waitTime, channelWeight, orderSize, rush hour multiplier (1.3 ช่วง 11-13, 17-20)
    - น้ำหนักช่องทาง: grabFood=1.2, lineMan=1.2, shopeeFood=1.1, walkIn=1.0, website=0.9
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 6.2 Implement reorderQueue — จัดเรียงออเดอร์ตาม priorityScore จากมากไปน้อย, จำนวนก่อน/หลังต้องเท่ากัน
    - _Requirements: 4.5_
  - [ ]* 6.3 Write property test สำหรับ Priority score non-negativity
    - **Property 5: Priority score non-negativity**
    - **Validates: Requirement 4.4**
  - [ ]* 6.4 Write property test สำหรับ Queue reorder preserves count
    - **Property 6: Queue reorder preserves count**
    - **Validates: Requirement 4.5**
  - [ ]* 6.5 Write property test สำหรับ Rush hour multiplier effect
    - **Property 7: Rush hour multiplier effect**
    - **Validates: Requirement 4.3**
  - [ ]* 6.6 Write property test สำหรับ Delivery app priority over direct channels
    - **Property 8: Delivery app priority over direct channels**
    - **Validates: Requirement 4.2**

### State Machine

- [x] 7. Implement Order State Machine
  - [x] 7.1 กำหนด validTransitions map — received→confirmed→preparing→ready→pickedUp→delivered, ทุกสถานะ (ยกเว้น pickedUp/delivered/cancelled) → cancelled
    - _Requirements: 5.1, 5.4_
  - [x] 7.2 Implement transitionOrderState — ตรวจสอบ valid transition, บันทึก history (fromStatus, toStatus, timestamp, actor), อัปเดตสถานะ
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 7.3 Implement getValidTransitions — คืนรายการสถานะที่เปลี่ยนไปได้จากสถานะปัจจุบัน
    - _Requirements: 5.1_
  - [ ]* 7.4 Write property test สำหรับ State transition validity
    - **Property 9: State transition validity**
    - **Validates: Requirements 5.1, 5.2, 5.4**
  - [ ]* 7.5 Write property test สำหรับ State transition histo,ry growth
    - **Property 10: State transition history growth**
    - **Validates: Requirement 5.3**

### Kitchen Display System (KDS)

- [x] 8. Implement Kitchen Display System (KDS)
  - [x] 8.1 สร้างหน้าจอ KDS — แสดงออเดอร์เรียงตาม priorityScore จากมากไปน้อย
    - _Requirements: 16.1, 16.2_
  - [x] 8.2 Implement real-time notification — ออเดอร์ใหม่แสดงบน KDS ทันที (WebSocket)
    - _Requirements: 16.1, 5.5_
  - [x] 8.3 Implement อัปเดตสถานะจาก KDS — พนักงานครัวกดเปลี่ยนสถานะ → เรียก State Machine → บันทึกประวัติ
    - _Requirements: 16.3_
  - [x] 8.4 ออเดอร์ที่ delivered/cancelled → ย้ายออกจากรายการ active
    - _Requirements: 16.4_
  - [ ]* 8.5 Write property test สำหรับ KDS displays orders sorted by priority
    - **Property 29: KDS displays orders sorted by priority**
    - **Validates: Requirement 16.2**
  - [ ]* 8.6 Write property test สำหรับ KDS excludes terminal orders
    - **Property 30: KDS excludes terminal orders**
    - **Validates: Requirement 16.4**

### Notification Service

- [x] 9. Implement Notification Service
  - [x] 9.1 Implement notifyNewOrder — แจ้งเตือน KDS และ Dashboard เมื่อมีออเดอร์ใหม่
    - _Requirements: 5.5, 16.1_
  - [x] 9.2 Implement notifyStateChange — แจ้งเตือนเมื่อสถานะออเดอร์เปลี่ยน
    - _Requirements: 5.5_

- [ ] 10. Checkpoint — Sprint 2
  - ตรวจสอบว่า Priority Engine คำนวณถูกต้อง, State Machine ทำงานตาม flow, KDS แสดงออเดอร์ real-time
  - Ensure all tests pass, ask the user if questions arise.

---

## Sprint 3 (สัปดาห์ 5-6): ระบบการเงิน

เป้าหมาย: Finance Engine, Income Recording, Expense Manager, VAT Calculation — บันทึกรายรับรายจ่ายได้

### Finance Engine & Income Recording

- [x] 11. Implement Finance Engine และบันทึกรายรับ
  - [x] 11.1 Implement createIncomeFromOrder — สร้าง IncomeRecord อัตโนมัติเมื่อออเดอร์ delivered, คำนวณ commission และ VAT
    - commissionAmount = grossAmount × commissionRate, netAmount = grossAmount - commissionAmount
    - walkIn/website → commissionRate = 0
    - VAT (ถ้าจด) = grossAmount × 7/107
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [x] 11.2 เชื่อมต่อ State Machine → Finance Engine — เมื่อออเดอร์เปลี่ยนเป็น "delivered" ให้เรียก createIncomeFromOrder อัตโนมัติ
    - _Requirements: 7.1_
  - [x] 11.3 Implement recordManualIncome — บันทึกรายรับด้วยมือสำหรับรายรับอื่นๆ
    - _Requirements: 7.4_
  - [ ]* 11.4 Write property test สำหรับ Income record financial integrity
    - **Property 13: Income record financial integrity**
    - **Validates: Requirements 7.2, 7.3, 7.5, 7.6**
  - [ ]* 11.5 Write property test สำหรับ Income record from order completeness
    - **Property 14: Income record from order completeness**
    - **Validates: Requirement 7.4**

### VAT Calculation

- [x] 12. Implement การคำนวณ VAT
  - [x] 12.1 Implement computeVAT — คำนวณ outputVAT (7/107 จากรายรับ), inputVAT (7% จากรายจ่าย), netVAT = outputVAT - inputVAT
    - ถ้าไม่ได้จด VAT → return null, vatAmount = 0 ทุกรายการ
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  - [ ]* 12.2 Write property test สำหรับ VAT calculation correctness
    - **Property 15: VAT calculation correctness (VAT registered)**
    - **Validates: Requirements 8.1, 8.2, 8.3**
  - [ ]* 12.3 Write property test สำหรับ VAT is zero when not registered
    - **Property 16: VAT is zero when not registered**
    - **Validates: Requirement 8.4**

### Expense Manager

- [x] 13. Implement Expense Manager
  - [x] 13.1 Implement validateExpense — ตรวจสอบ amount > 0, description ไม่ว่าง
    - _Requirements: 9.2, 9.3_
  - [x] 13.2 Implement createExpenseRecord — บันทึกรายจ่ายพร้อม category, คำนวณ VAT ซื้อ (ถ้าจด VAT)
    - รองรับ 10 หมวดหมู่: ingredients, rent, utilities, staffWages, equipment, marketing, packaging, delivery, maintenance, other
    - _Requirements: 9.1, 9.4_
  - [x] 13.3 Implement listExpenses, updateExpense, deleteExpense — ดึง/แก้ไข/ลบรายจ่าย
    - _Requirements: 9.6_
  - [x] 13.4 สร้าง UI บันทึกรายจ่าย — ฟอร์มกรอกหมวดหมู่, จำนวนเงิน, รายละเอียด, แนบหลักฐาน (optional)
    - _Requirements: 9.1, 9.5_
  - [ ]* 13.5 Write property test สำหรับ Expense validation rejects invalid input
    - **Property 17: Expense validation rejects invalid input**
    - **Validates: Requirements 9.2, 9.3**

### Profit & Loss Calculation

- [x] 14. Implement การคำนวณกำไร/ขาดทุน
  - [x] 14.1 Implement getIncomeSummary และ getExpenseSummary — สรุปรายรับรายจ่ายตามช่วงเวลา
    - _Requirements: 14.1_
  - [x] 14.2 Implement computeProfitLoss — grossProfit = totalNetIncome - totalExpenses, netProfit หัก vatPayable (ถ้า > 0)
    - _Requirements: 14.1, 14.2, 14.3_
  - [ ]* 14.3 Write property test สำหรับ Profit and loss calculation
    - **Property 27: Profit and loss calculation**
    - **Validates: Requirements 14.1, 14.2, 14.3**

- [ ] 15. Checkpoint — Sprint 3
  - ตรวจสอบว่ารายรับบันทึกอัตโนมัติเมื่อ delivered, รายจ่ายบันทึกได้, VAT คำนวณถูกต้อง, กำไร/ขาดทุนถูกต้อง
  - Ensure all tests pass, ask the user if questions arise.

---

## Sprint 4 (สัปดาห์ 7-8): ระบบวิเคราะห์กำไร

เป้าหมาย: GP Calculation, Actual Selling Price, Profit Analysis, Channel Revenue Tracker — วิเคราะห์กำไรแยกตามเมนู/ช่องทางได้

### GP Calculation

- [x] 16. Implement การคำนวณ GP ต่อเมนู
  - [x] 16.1 Implement calculateItemGP — gpPercentage = (unitPrice - costPrice) / unitPrice × 100, grossProfitPerUnit = unitPrice - costPrice
    - gpPercentage ติดลบได้ (ขายต่ำกว่าทุน) แต่ <= 100, costPrice >= 0
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  - [x] 16.2 Implement getLowGPItems — ดึงเมนูที่ gpPercentage ต่ำกว่า threshold ที่กำหนด
    - _Requirements: 11.6_
  - [ ]* 16.3 Write property test สำหรับ GP calculation correctness
    - **Property 20: GP calculation correctness**
    - **Validates: Requirements 11.1, 11.2, 11.4, 11.5**
  - [ ]* 16.4 Write property test สำหรับ Low GP items filter
    - **Property 21: Low GP items filter**
    - **Validates: Requirement 11.6**

### Actual Selling Price

- [x] 17. Implement การคำนวณราคาขายจริง
  - [x] 17.1 Implement calculateActualSellingPrice — actualSellingPrice = totalSellingPrice - commissionAmount - vatAmount
    - walkIn/website + ไม่จด VAT → actualSellingPrice = totalSellingPrice
    - _Requirements: 12.1, 12.3_
  - [ ]* 17.2 Write property test สำหรับ Actual selling price decomposition
    - **Property 22: Actual selling price decomposition**
    - **Validates: Requirements 12.1, 12.2**
  - [ ]* 17.3 Write property test สำหรับ Walk-in/website actual selling price advantage
    - **Property 23: Walk-in/website actual selling price advantage**
    - **Validates: Requirement 12.4**

### Order Profit Analysis

- [x] 18. Implement การวิเคราะห์กำไรต่อออเดอร์และช่องทาง
  - [x] 18.1 Implement analyzeOrderProfit — คำนวณ grossProfit, netProfit, netProfitMargin ต่อออเดอร์
    - _Requirements: 13.1, 13.2, 13.3_
  - [x] 18.2 Implement analyzeChannelProfit — วิเคราะห์กำไรแยกตามช่องทาง, รวมเฉพาะออเดอร์ "delivered" ในช่วงเวลา
    - _Requirements: 13.4_
  - [x] 18.3 Implement generateProfitReport — สร้างรายงานกำไรรวม แยกตาม byItem, byCategory, byChannel
    - _Requirements: 13.6_
  - [ ]* 18.4 Write property test สำหรับ Order profit calculation consistency
    - **Property 24: Order profit calculation consistency**
    - **Validates: Requirements 13.1, 13.2, 13.3**
  - [ ]* 18.5 Write property test สำหรับ Channel profit analysis includes only delivered orders
    - **Property 25: Channel profit analysis includes only delivered orders**
    - **Validates: Requirement 13.4**
  - [ ]* 18.6 Write property test สำหรับ Overall profit equals sum of channel profits
    - **Property 26: Overall profit equals sum of channel profits**
    - **Validates: Requirement 13.5**

### Channel Revenue Tracker

- [x] 19. Implement Channel Revenue Tracker
  - [x] 19.1 Implement computeChannelRevenue — สรุปยอดแยกตามช่องทาง (totalOrders, grossRevenue, totalCommission, netRevenue, averageOrderValue)
    - _Requirements: 10.1, 10.2_
  - [x] 19.2 Implement compareAllChannels — เปรียบเทียบช่องทาง, หา bestChannel (ยอดสุทธิสูงสุด)
    - _Requirements: 10.4, 10.5_
  - [ ]* 19.3 Write property test สำหรับ Channel revenue consistency
    - **Property 18: Channel revenue consistency**
    - **Validates: Requirements 10.3, 10.5**
  - [ ]* 19.4 Write property test สำหรับ Best channel identification
    - **Property 19: Best channel identification**
    - **Validates: Requirement 10.4**

- [ ] 20. Checkpoint — Sprint 4
  - ตรวจสอบว่า GP คำนวณถูกต้อง, ราคาขายจริงถูกต้อง, กำไรต่อออเดอร์/ช่องทางถูกต้อง, สรุปยอดรายช่องทางถูกต้อง
  - Ensure all tests pass, ask the user if questions arise.

---

## Sprint 5 (สัปดาห์ 9-10): รายงานและ Dashboard

เป้าหมาย: Tax Report Generator, Finance Dashboard, Export PDF/CSV, Security & Audit — สร้างรายงานภาษีและ dashboard สำหรับเจ้าของร้าน

### Tax Report Generator

- [x] 21. Implement Tax Report Generator
  - [x] 21.1 Implement generateTaxReport — สร้างรายงานภาษีตามประเภท (monthly, yearly, vat) ครอบคลุมทุกรายการในช่วงเวลา
    - รายงานต้องรวม IncomeSummary, ExpenseSummary, ProfitLossSummary, VATSummary (ถ้าจด VAT)
    - _Requirements: 15.1, 15.2, 15.5_
  - [x] 21.2 Implement date validation — startDate < endDate, ปฏิเสธถ้าช่วงเวลาไม่ถูกต้อง
    - _Requirements: 15.4_
  - [ ]* 21.3 Write property test สำหรับ Tax report completeness
    - **Property 28: Tax report completeness**
    - **Validates: Requirement 15.1**

### Export PDF/CSV

- [ ] 22. Implement Export รายงาน
  - [ ] 22.1 Implement exportReport — export เป็น PDF สำหรับพิมพ์
    - _Requirements: 15.3_
  - [ ] 22.2 Implement exportReport — export เป็น CSV/XLSX สำหรับนำไปใช้ต่อ
    - _Requirements: 15.3_

### Finance Dashboard

- [x] 23. สร้าง Finance Dashboard
  - [x] 23.1 สร้างหน้า Dashboard แสดงสรุปรายรับรายจ่าย — ยอดรวม, แยกตามช่องทาง, แยกตามหมวดหมู่รายจ่าย
    - _Requirements: 10.1, 10.2_
  - [x] 23.2 สร้างหน้าวิเคราะห์กำไร — แสดง GP% ต่อเมนู, กำไรสุทธิต่อช่องทาง, เมนูที่ GP ต่ำ
    - _Requirements: 11.6, 13.6_
  - [x] 23.3 สร้างหน้าสร้างรายงานภาษี — เลือกช่วงเวลา, ประเภทรายงาน, กด export
    - _Requirements: 15.1, 15.3_

### Security & Audit Trail

- [ ] 24. Implement Security และ Audit Trail
  - [ ] 24.1 Implement ระบบ login — พนักงานต้อง login ก่อนใช้งาน
    - _Requirements: 17.1_
  - [ ] 24.2 Implement audit trail — ทุกออเดอร์บันทึก enteredBy, ทุก state transition บันทึก actor, ทุก record บันทึก recordedBy
    - _Requirements: 17.2, 17.3, 17.4_
  - [ ]* 24.3 Write property test สำหรับ Audit trail completeness
    - **Property 31: Audit trail completeness**
    - **Validates: Requirements 17.2, 17.3, 17.4**

- [ ] 25. Final Checkpoint — Sprint 5
  - ตรวจสอบว่ารายงานภาษีสร้างได้ถูกต้อง, export PDF/CSV ได้, Dashboard แสดงข้อมูลครบ, audit trail ทำงาน
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks ที่มี `*` เป็น optional — ข้ามได้ถ้าต้องการ MVP เร็วขึ้น
- ทุก task อ้างอิง requirements เพื่อ traceability
- Checkpoints ท้าย sprint เพื่อตรวจสอบความถูกต้องก่อนไป sprint ถัดไป
- Property tests ใช้ fast-check (TypeScript) ตาม design document
- ภาษาที่ใช้พัฒนา: TypeScript
