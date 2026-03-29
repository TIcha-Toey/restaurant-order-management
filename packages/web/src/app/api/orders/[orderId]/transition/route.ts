import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const validTransitions: Record<string, string[]> = {
  received: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["pickedUp", "cancelled"],
  pickedUp: ["delivered"],
  delivered: [],
  cancelled: [],
}

const commissionRates: Record<string, number> = {
  grabFood: 0.30, lineMan: 0.30, shopeeFood: 0.25, walkIn: 0, website: 0,
}

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const { newStatus, actor } = await req.json()

  const order = await prisma.order.findUnique({ where: { orderId } })
  if (!order) return NextResponse.json({ success: false, error: `ไม่พบออเดอร์ ${orderId}` }, { status: 404 })

  const allowed = validTransitions[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    return NextResponse.json({ success: false, error: `ไม่สามารถเปลี่ยนจาก "${order.status}" เป็น "${newStatus}"` }, { status: 400 })
  }

  // Update order + create transition in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { orderId }, data: { status: newStatus } })
    await tx.orderTransition.create({
      data: { orderId, fromStatus: order.status, toStatus: newStatus, timestamp: BigInt(Date.now()), actor },
    })

    // Auto record income when delivered
    if (newStatus === "delivered") {
      const gross = order.totalAmount
      const rate = commissionRates[order.channel] ?? 0
      const commission = gross * rate
      const net = gross - commission
      await tx.incomeRecord.create({
        data: {
          recordId: `INC-${Date.now()}`,
          source: "order",
          orderId,
          channel: order.channel,
          grossAmount: gross,
          commissionRate: rate,
          commissionAmount: commission,
          netAmount: net,
          vatAmount: 0,
          description: `ออเดอร์ ${orderId}`,
          recordedAt: BigInt(Date.now()),
          recordedBy: actor,
        },
      })
    }
  })

  return NextResponse.json({ success: true })
}
