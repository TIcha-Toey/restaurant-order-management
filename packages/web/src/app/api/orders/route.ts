import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/orders — ดึงออเดอร์ทั้งหมด
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const active = searchParams.get("active")

  const where: Record<string, unknown> = {}
  if (status) where.status = status
  if (active === "true") where.status = { notIn: ["delivered", "cancelled"] }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { orderTime: "desc" },
  })

  return NextResponse.json(orders.map((o) => ({ ...o, items: o.items, orderTime: Number(o.orderTime) })))
}

// POST /api/orders — สร้างออเดอร์ใหม่
export async function POST(req: Request) {
  const body = await req.json()
  const { channel, items, details, enteredBy } = body

  // Validate
  if (!items || items.length === 0) {
    return NextResponse.json({ success: false, error: "ต้องมีรายการอาหารอย่างน้อย 1 รายการ" }, { status: 400 })
  }
  for (const item of items) {
    if (item.quantity <= 0) {
      return NextResponse.json({ success: false, error: `จำนวนสินค้าต้องมากกว่า 0 (${item.name})` }, { status: 400 })
    }
  }
  if (!enteredBy?.trim()) {
    return NextResponse.json({ success: false, error: "ต้องระบุพนักงานที่กรอกออเดอร์" }, { status: 400 })
  }

  // Duplicate check
  const extId = details?.externalOrderId
  if (extId) {
    const dup = await prisma.order.findFirst({ where: { externalOrderId: extId, channel } })
    if (dup) {
      return NextResponse.json({ success: false, error: `ออเดอร์ซ้ำ: ${extId} ช่องทาง ${channel} (${dup.orderId})` }, { status: 409 })
    }
  }

  const orderId = `ORD-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  const totalAmount = items.reduce((s: number, i: { unitPrice: number; quantity: number }) => s + i.unitPrice * i.quantity, 0)
  const totalCost = items.reduce((s: number, i: { costPrice: number; quantity: number }) => s + i.costPrice * i.quantity, 0)

  const order = await prisma.order.create({
    data: {
      orderId,
      channel,
      externalOrderId: extId || null,
      items,
      totalAmount,
      totalCost,
      customerName: details?.customerName || null,
      customerPhone: details?.customerPhone || null,
      deliveryAddress: details?.deliveryAddress || null,
      orderTime: BigInt(Date.now()),
      status: "received",
      priorityScore: 0,
      notes: details?.notes || null,
      enteredBy,
    },
  })

  return NextResponse.json({ success: true, orderId: order.orderId, order: { ...order, orderTime: Number(order.orderTime) } })
}
