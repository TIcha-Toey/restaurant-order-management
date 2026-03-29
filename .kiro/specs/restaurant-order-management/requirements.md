# 📋 Requirements — ระบบจัดการออเดอร์ร้านอาหาร

## บทนำ

ระบบรวมออเดอร์จากทุกช่องทาง (GrabFood, LINE MAN, ShopeeFood, Walk-in, Website) เข้ามาที่เดียว
ให้พนักงานกรอกออเดอร์ง่าย จัดลำดับความสำคัญ ติดตามสถานะ บันทึกรายรับรายจ่าย วิเคราะห์กำไร และสร้างรายงานภาษี

## 📖 คำศัพท์

| คำศัพท์ | ความหมาย |
|---------|----------|
| Order_Entry_UI | หน้าจอกรอกออเดอร์ — เลือกช่องทาง → เลือกเมนู → กรอกรายละเอียด → ยืนยัน |
| Order_Aggregator | ตัวกลางรับออเดอร์ ตรวจสอบข้อมูล สร้าง Order ID บันทึกลง DB |
| Priority_Engine | คำนวณลำดับความสำคัญออเดอร์ (เวลารอ, ช่องทาง, rush hour) |
| State_Machine | จัดการ lifecycle ออเดอร์ ควบคุมการเปลี่ยนสถานะ |
| Finance_Engine | บันทึกรายรับรายจ่าย คำนวณค่าคอมมิชชัน รวมข้อมูลรายงาน |
| Expense_Manager | จัดการรายจ่ายร้าน หลายหมวดหมู่ แนบหลักฐานได้ |
| Channel_Revenue_Tracker | สรุปยอดรายรับแยกตาม delivery app/ช่องทาง |
| Tax_Report_Generator | สร้างรายงานภาษี export PDF/CSV |
| Profit_Analyzer | วิเคราะห์กำไร GP, ราคาขายจริง, กำไรสุทธิ ต่อเมนู/ออเดอร์/ช่องทาง |
| Kitchen_Display_System (KDS) | หน้าจอแสดงออเดอร์สำหรับครัว |
| ChannelSource | ช่องทาง: grabFood, lineMan, shopeeFood, walkIn, website |
| OrderStatus | สถานะ: received → confirmed → preparing → ready → pickedUp → delivered / cancelled |
| UnifiedOrder | โครงสร้างข้อมูลออเดอร์หลัก |
| GP (Gross Profit) | กำไรขั้นต้น = ราคาขาย - ต้นทุน |
| VAT | ภาษีมูลค่าเพิ่ม 7% (สูตร 7/107 แยกจากราคารวม VAT) |
| Commission | ค่าคอมมิชชันที่ delivery app หักจากยอดขาย |
| Actual_Selling_Price | ราคาขายจริงหลังหักค่าคอมมิชชันและ VAT |

---

## 🍳 ระบบออเดอร์

### Requirement 1: สร้างออเดอร์

**เรื่องราว:** พนักงานหน้าร้านอยากกรอกออเดอร์จากทุกช่องทางในที่เดียว จะได้ไม่สับสน

**สิ่งที่ต้องทำ:**

- 1.1 เปิดหน้าสร้างออเดอร์ → แสดงรายการช่องทางทั้งหมด (grabFood, lineMan, shopeeFood, walkIn, website) ให้เลือก
- 1.2 เลือกช่องทางแล้ว → ดึงเมนูที่พร้อมขายจาก Menu Database มาแสดง
- 1.3 เลือกเมนู กรอกจำนวน หมายเหตุ ครบแล้วกดยืนยัน → ส่งข้อมูลไปยัง Order_Aggregator
- 1.4 สร้างออเดอร์สำเร็จ → ล้างฟอร์มพร้อมรับออเดอร์ถัดไป
- 1.5 ยังไม่ได้เลือกช่องทาง → ปิดปุ่มเลือกเมนูและปุ่มยืนยัน

---

### Requirement 2: ตรวจสอบออเดอร์

**เรื่องราว:** ระบบต้องตรวจสอบข้อมูลออเดอร์ก่อนบันทึก ป้องกันข้อมูลผิดพลาด

**สิ่งที่ต้องทำ:**

- 2.1 ออเดอร์ส่งมาที่ Order_Aggregator → ตรวจว่ามีรายการอาหารอย่างน้อย 1 รายการ
- 2.2 ถ้ามี item ที่ quantity <= 0 → ปฏิเสธ แจ้ง error "จำนวนสินค้าต้องมากกว่า 0"
- 2.3 ถ้าไม่มีข้อมูล enteredBy → ปฏิเสธ แจ้ง error "ต้องระบุพนักงานที่กรอกออเดอร์"
- 2.4 ผ่าน validation → สร้าง orderId ไม่ซ้ำ บันทึกลง DB ส่งต่อไป Priority_Engine
- 2.5 คำนวณ totalAmount = ผลรวมของ (unitPrice × quantity) ทุก item อัตโนมัติ
- 2.6 คำนวณ totalCost = ผลรวมของ (costPrice × quantity) ทุก item อัตโนมัติ
- 2.7 ออเดอร์ใหม่ → กำหนดสถานะเริ่มต้นเป็น "received" เสมอ

---

### Requirement 3: ป้องกันออเดอร์ซ้ำ

**เรื่องราว:** พนักงานไม่อยากกรอกออเดอร์ซ้ำ จะได้ไม่สับสนในครัว

**สิ่งที่ต้องทำ:**

- 3.1 กดยืนยันออเดอร์ → ปิดปุ่มยืนยันทันทีกัน double-submit
- 3.2 ถ้า externalOrderId + channel ซ้ำกับออเดอร์ที่มีอยู่ → ปฏิเสธ แสดง link ไปออเดอร์เดิม

---

### Requirement 4: จัดลำดับความสำคัญ

**เรื่องราว:** พนักงานครัวอยากเห็นออเดอร์เรียงตามความเร่งด่วน จะได้ทำออเดอร์สำคัญก่อน

**สิ่งที่ต้องทำ:**

- 4.1 ออเดอร์ใหม่เข้าระบบ → คำนวณ priorityScore จาก: เวลารอ (waitTime), น้ำหนักช่องทาง (channelWeight), จำนวนรายการ (orderSize), rush hour multiplier
- 4.2 น้ำหนักช่องทาง: grabFood=1.2, lineMan=1.2, shopeeFood=1.1, walkIn=1.0, website=0.9
- 4.3 ช่วง rush hour (11:00-13:00 หรือ 17:00-20:00) → คูณ priorityScore ด้วย 1.3
- 4.4 priorityScore ต้อง >= 0 เสมอ
- 4.5 จัดเรียงคิวใหม่ → จำนวนออเดอร์ก่อนและหลังต้องเท่ากัน

---

### Requirement 5: จัดการสถานะออเดอร์

**เรื่องราว:** พนักงานอยากเปลี่ยนสถานะออเดอร์ตามขั้นตอน เพื่อติดตามความคืบหน้า

**สิ่งที่ต้องทำ:**

- 5.1 เปลี่ยนสถานะได้ตามเส้นทางนี้เท่านั้น: received → confirmed → preparing → ready → pickedUp → delivered ทุกสถานะ (ยกเว้น pickedUp, delivered, cancelled) เปลี่ยนเป็น cancelled ได้
- 5.2 พยายามเปลี่ยนสถานะที่ไม่ valid → ปฏิเสธ แจ้ง error ระบุสถานะปัจจุบันและสถานะที่พยายามเปลี่ยน
- 5.3 เปลี่ยนสถานะสำเร็จ → เพิ่ม history 1 รายการ (fromStatus, toStatus, timestamp, actor)
- 5.4 ออเดอร์อยู่ในสถานะ "delivered" หรือ "cancelled" → ปฏิเสธการเปลี่ยนสถานะทุกกรณี
- 5.5 สถานะเปลี่ยน → แจ้งเตือน Kitchen_Display_System และ Dashboard ทันที

---

### Requirement 6: จัดการเมนู

**เรื่องราว:** พนักงานอยากค้นหาและเลือกเมนูได้เร็ว จะได้กรอกออเดอร์ไว

**สิ่งที่ต้องทำ:**

- 6.1 แสดงเฉพาะเมนูที่ isAvailable = true
- 6.2 ค้นหาเมนูด้วย keyword → แสดงเมนูที่ตรงกับ keyword
- 6.3 ตอน submit ถ้าเมนูที่เลือกไว้ไม่พร้อมขายแล้ว → แจ้งพนักงานให้เลือกเมนูทดแทนหรือลบออก

---

### Requirement 16: Kitchen Display System (KDS)

**เรื่องราว:** พนักงานครัวอยากเห็นออเดอร์เรียงตามลำดับความสำคัญบนหน้าจอ

**สิ่งที่ต้องทำ:**

- 16.1 ออเดอร์ใหม่เข้าระบบ → แสดงบน KDS ทันทีผ่าน real-time notification
- 16.2 แสดงออเดอร์เรียงตาม priorityScore จากมากไปน้อย
- 16.3 พนักงานครัวอัปเดตสถานะบน KDS → State_Machine เปลี่ยนสถานะและบันทึกประวัติ
- 16.4 ออเดอร์เป็น "delivered" หรือ "cancelled" → ย้ายออกจากรายการที่ต้องทำ

---

## 💰 ระบบการเงิน

### Requirement 7: บันทึกรายรับอัตโนมัติ

**เรื่องราว:** เจ้าของร้านอยากให้ระบบบันทึกรายรับเองเมื่อออเดอร์ส่งมอบสำเร็จ ไม่ต้องกรอกมือ

**สิ่งที่ต้องทำ:**

- 7.1 ออเดอร์เปลี่ยนเป็น "delivered" → สร้าง IncomeRecord อัตโนมัติจากข้อมูลออเดอร์
- 7.2 คำนวณ commissionAmount = grossAmount × commissionRate
- 7.3 คำนวณ netAmount = grossAmount - commissionAmount
- 7.4 ถ้า source = "order" → ต้องบันทึก orderId และ channel ให้ครบ
- 7.5 ช่องทาง walkIn หรือ website → commissionRate = 0
- 7.6 commissionRate ต้องอยู่ระหว่าง 0 ถึง 1 เสมอ

---

### Requirement 8: คำนวณ VAT

**เรื่องราว:** เจ้าของร้านที่จด VAT อยากให้ระบบคำนวณ VAT ถูกต้องตามหลักภาษีไทย

**สิ่งที่ต้องทำ:**

- 8.1 ร้านจด VAT → คำนวณ VAT ขาย (outputVAT) = grossAmount × 7 / 107
- 8.2 ร้านจด VAT → คำนวณ VAT ซื้อ (inputVAT) จากรายจ่ายด้วยอัตรา 7%
- 8.3 ร้านจด VAT → คำนวณ VAT ที่ต้องนำส่ง (netVAT) = outputVAT - inputVAT
- 8.4 ร้านไม่ได้จด VAT → vatAmount = 0 ทุกรายการ

---

### Requirement 9: บันทึกรายจ่าย

**เรื่องราว:** เจ้าของร้านอยากบันทึกรายจ่ายแยกหมวดหมู่ เพื่อติดตามค่าใช้จ่ายและคำนวณกำไรขาดทุน

**สิ่งที่ต้องทำ:**

- 9.1 กรอกรายจ่ายครบ (หมวดหมู่, จำนวนเงิน, รายละเอียด) กดบันทึก → สร้าง ExpenseRecord บันทึกลง DB
- 9.2 จำนวนเงิน <= 0 → ปฏิเสธ แจ้ง error "จำนวนเงินต้องมากกว่า 0"
- 9.3 รายละเอียดว่าง → ปฏิเสธ แจ้ง error "กรุณากรอกรายละเอียด"
- 9.4 รองรับหมวดหมู่: ingredients, rent, utilities, staffWages, equipment, marketing, packaging, delivery, maintenance, other
- 9.5 (ถ้าต้องการ) แนบ URL ใบเสร็จหรือรูปภาพได้
- 9.6 แก้ไขหรือลบรายจ่ายที่บันทึกผิดได้

---

### Requirement 10: สรุปยอดรายช่องทาง

**เรื่องราว:** เจ้าของร้านอยากเห็นยอดขายแยกตามแต่ละ delivery app เพื่อเปรียบเทียบ performance

**สิ่งที่ต้องทำ:**

- 10.1 เลือกช่วงเวลา → แสดงยอดรายรับแยกตามช่องทาง (grabFood, lineMan, shopeeFood, walkIn, website)
- 10.2 แสดงข้อมูลต่อช่องทาง: จำนวนออเดอร์ (totalOrders), ยอดรวม (grossRevenue), ค่าคอมมิชชัน (totalCommission), ยอดสุทธิ (netRevenue), ยอดเฉลี่ยต่อออเดอร์ (averageOrderValue)
- 10.3 คำนวณ averageOrderValue = grossRevenue / totalOrders (เมื่อ totalOrders > 0)
- 10.4 เปรียบเทียบช่องทาง → ระบุช่องทางที่ยอดสุทธิสูงสุด (bestChannel)
- 10.5 ผลรวม grossRevenue ทุกช่องทาง ต้องเท่ากับ totalGrossRevenue ใน ChannelComparison

---

### Requirement 14: คำนวณกำไร/ขาดทุน

**เรื่องราว:** เจ้าของร้านอยากเห็นสรุปกำไร/ขาดทุนรายเดือน เพื่อประเมินผลประกอบการ

**สิ่งที่ต้องทำ:**

- 14.1 คำนวณ grossProfit = totalNetIncome - totalExpenses
- 14.2 ร้านจด VAT → คำนวณ vatPayable = outputVAT - inputVAT
- 14.3 คำนวณ netProfit โดยหัก vatPayable (ถ้า vatPayable > 0) จาก grossProfit

---

### Requirement 15: สร้างรายงานภาษี

**เรื่องราว:** เจ้าของร้านอยากสร้างรายงานรายรับรายจ่ายสำหรับยื่นภาษีได้สะดวกและถูกต้อง

**สิ่งที่ต้องทำ:**

- 15.1 เลือกช่วงเวลาและประเภทรายงาน → สร้างรายงานครอบคลุมทุกรายการในช่วงนั้น
- 15.2 รองรับประเภทรายงาน: monthly (รายเดือน), yearly (รายปี สำหรับ ภ.ง.ด.), vat (ภ.พ.30)
- 15.3 กด export → สร้างไฟล์ PDF หรือ CSV/XLSX ตามที่เลือก
- 15.4 ถ้า startDate >= endDate → ปฏิเสธ แจ้ง error "กรุณาเลือกช่วงเวลาที่ถูกต้อง"
- 15.5 รายงานต้องรวม IncomeSummary, ExpenseSummary, ProfitLossSummary และ VATSummary (ถ้าจด VAT)

---

## 📊 ระบบวิเคราะห์กำไร

### Requirement 11: คำนวณ GP ต่อเมนู

**เรื่องราว:** เจ้าของร้านอยากรู้ GP% ของแต่ละเมนู จะได้ตัดสินใจว่าควรปรับราคาหรือลดต้นทุนเมนูไหน

**สิ่งที่ต้องทำ:**

- 11.1 คำนวณ gpPercentage = (unitPrice - costPrice) / unitPrice × 100 (เมื่อ unitPrice > 0)
- 11.2 คำนวณ grossProfitPerUnit = unitPrice - costPrice
- 11.3 ถ้า costPrice > unitPrice → แสดง gpPercentage เป็นค่าติดลบ (ขายต่ำกว่าทุน)
- 11.4 gpPercentage ต้อง <= 100 เสมอ
- 11.5 costPrice ต้อง >= 0 เสมอ
- 11.6 เจ้าของร้านกำหนด GP threshold → แสดงรายการเมนูที่ gpPercentage ต่ำกว่า threshold

---

### Requirement 12: คำนวณราคาขายจริง

**เรื่องราว:** เจ้าของร้านอยากรู้ราคาขายจริงหลังหักค่าคอมมิชชันและ VAT เพื่อเข้าใจรายได้จริงแต่ละช่องทาง

**สิ่งที่ต้องทำ:**

- 12.1 คำนวณ actualSellingPrice = totalSellingPrice - commissionAmount - vatAmount
- 12.2 ตรวจสอบว่า actualSellingPrice + commissionAmount + vatAmount = totalSellingPrice เสมอ
- 12.3 ช่องทาง walkIn/website + ร้านไม่ได้จด VAT → actualSellingPrice = totalSellingPrice
- 12.4 เปรียบเทียบราคาขายจริงระหว่างช่องทาง (ยอดขายเท่ากัน) → actualSellingPrice ของ walkIn/website >= delivery app เสมอ

---

### Requirement 13: วิเคราะห์กำไรต่อออเดอร์และช่องทาง

**เรื่องราว:** เจ้าของร้านอยากวิเคราะห์กำไรสุทธิต่อออเดอร์และแยกตามช่องทาง จะได้ตัดสินใจว่าควรเน้นช่องทางไหน

**สิ่งที่ต้องทำ:**

- 13.1 คำนวณ grossProfit ต่อออเดอร์ = totalSellingPrice - totalCostPrice
- 13.2 คำนวณ netProfit ต่อออเดอร์ = actualSellingPrice - totalCostPrice
- 13.3 คำนวณ netProfitMargin = netProfit / totalSellingPrice × 100 (เมื่อ totalSellingPrice > 0)
- 13.4 วิเคราะห์กำไรแยกตามช่องทาง → รวมเฉพาะออเดอร์ที่ "delivered" ในช่วงเวลาที่เลือก
- 13.5 ผลรวม totalNetProfit ทุกช่องทาง ต้องเท่ากับ totalNetProfit ใน OverallProfitSummary
- 13.6 สร้างรายงานกำไรรวม → แสดงแยกตามเมนู (byItem), หมวดหมู่ (byCategory) และช่องทาง (byChannel)

---

## 🔒 ความปลอดภัย

### Requirement 17: Audit Trail

**เรื่องราว:** เจ้าของร้านอยากให้ระบบบันทึกว่าใครทำอะไร เพื่อตรวจสอบย้อนหลังได้

**สิ่งที่ต้องทำ:**

- 17.1 พนักงานต้อง login ก่อนใช้งาน
- 17.2 ทุกออเดอร์ต้องบันทึก enteredBy (พนักงานที่กรอก)
- 17.3 สถานะออเดอร์เปลี่ยน → บันทึก actor (พนักงานที่เปลี่ยน) ใน StateTransition history
- 17.4 ทุก IncomeRecord และ ExpenseRecord ต้องบันทึก recordedBy
