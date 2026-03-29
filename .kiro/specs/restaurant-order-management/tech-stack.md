# 🛠 Tech Stack — ระบบจัดการออเดอร์ร้านอาหาร

## ภาษาหลัก

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| TypeScript | ใช้ทั้ง Frontend และ Backend เพื่อให้ type-safe ตลอดทั้ง stack |

---

## Frontend

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| Next.js (React) | Order Entry UI, Kitchen Display (KDS), Finance Dashboard |
| Tailwind CSS | Styling — เขียน UI ได้เร็ว responsive ดี |
| Socket.io (client) | Real-time updates — ออเดอร์ใหม่แสดงบน KDS ทันที |
| React Hook Form | จัดการฟอร์มกรอกออเดอร์ / รายจ่าย |
| Zustand หรือ React Context | State management ฝั่ง client |

---

## Backend

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| Node.js + Fastify | API server — เร็วกว่า Express, รองรับ schema validation ในตัว |
| Socket.io (server) | WebSocket server สำหรับ real-time notifications |
| Prisma | ORM สำหรับ PostgreSQL — type-safe, migration ง่าย |
| Zod | Runtime validation สำหรับ request/response |

---

## Database & Cache

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| PostgreSQL | Database หลัก — orders, state history, menu items, income/expense, tax reports |
| Redis | Cache เมนู, active orders, priority queue, financial summary cache |

เหตุผลที่เลือก PostgreSQL:
- ข้อมูลการเงิน/ภาษีต้องการ relational integrity (foreign keys, transactions)
- รองรับ JSON column สำหรับข้อมูลที่ยืดหยุ่น (เช่น PriorityFactor)
- Query ซับซ้อนสำหรับรายงานทำได้ดี (GROUP BY channel, SUM revenue)

---

## Message Queue / Event System

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| BullMQ (Redis-based) | Event-driven processing — order delivered → auto income recording |

ใช้ BullMQ แทน RabbitMQ เพราะ:
- ใช้ Redis ที่มีอยู่แล้ว ไม่ต้องเพิ่ม infrastructure
- API ง่าย เหมาะกับ Node.js/TypeScript
- รองรับ retry, delay, priority queue ในตัว

---

## Report & Export

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| pdfkit | สร้าง PDF รายงานภาษี (เบา ไม่ต้องใช้ browser engine) |
| exceljs | สร้าง XLSX/CSV สำหรับ export ข้อมูลการเงิน |

---

## File Storage

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| AWS S3 หรือ MinIO | เก็บใบเสร็จ/หลักฐานรายจ่าย, ไฟล์รายงานที่ export |

MinIO เป็น S3-compatible ที่ self-host ได้ — เหมาะถ้าไม่อยากใช้ cloud

---

## Testing

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| Vitest | Unit test & integration test — เร็ว, รองรับ TypeScript ในตัว |
| fast-check | Property-based testing — ทดสอบ correctness properties ตาม design |
| Playwright | E2E test สำหรับ UI flows (เลือกช่องทาง → เลือกเมนู → submit) |

---

## DevOps & Infrastructure

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| Docker + Docker Compose | รัน PostgreSQL, Redis, MinIO ใน local development |
| GitHub Actions | CI/CD — รัน tests, build, deploy อัตโนมัติ |
| Nginx | Reverse proxy + serve static files (production) |

---

## Authentication

| เทคโนโลยี | ใช้ทำอะไร |
|-----------|----------|
| NextAuth.js | ระบบ login สำหรับพนักงาน — รองรับ credentials provider |

เหตุผล: ใช้ง่าย, integrate กับ Next.js ได้เลย, รองรับ role-based access

---

## โครงสร้างโปรเจกต์ (แนะนำ)

```
restaurant-order-management/
├── apps/
│   └── web/                    # Next.js app (UI ทั้งหมด)
│       ├── app/
│       │   ├── orders/         # Order Entry UI
│       │   ├── kitchen/        # Kitchen Display (KDS)
│       │   ├── finance/        # Finance Dashboard
│       │   └── reports/        # Tax Reports
│       └── components/
├── packages/
│   ├── core/                   # Business logic (validation, state machine, priority, GP, VAT)
│   ├── db/                     # Prisma schema + migrations
│   └── types/                  # Shared TypeScript types/interfaces
├── docker-compose.yml          # PostgreSQL + Redis + MinIO
├── package.json
└── turbo.json                  # Turborepo config (ถ้าใช้ monorepo)
```

---

## สรุป Tech Stack ทั้งหมด

```
Frontend:  Next.js + Tailwind CSS + Socket.io + React Hook Form
Backend:   Node.js + Fastify + Prisma + Zod + Socket.io
Database:  PostgreSQL + Redis
Queue:     BullMQ (Redis-based)
Reports:   pdfkit + exceljs
Storage:   S3 / MinIO
Testing:   Vitest + fast-check + Playwright
Auth:      NextAuth.js
DevOps:    Docker + GitHub Actions + Nginx
```
