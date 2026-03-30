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

// Map status → timestamp field name
const statusToField: Record<string, string> = {
  received: "receivedAt",
  confirmed: "confirmedAt",
  preparing: "preparingAt",
  ready: "readyAt",
  pickedUp: "pickedUpAt",
  delivered: "deliveredAt",
  cancelled: "cancelledAt",
}

export async function POST(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params
  const { newStatus, actor, reason } = await req.json()

  const order = await prisma.order.findUnique({ where: { orderId } })
  if (!order) return NextResponse.json({ success: false, error: `ไม่พบออเดอร์ ${orderId}` }, { status: 404 })

  const allowed = validTransitions[order.status] ?? []
  if (!allowed.includes(newStatus)) {
    return NextResponse.json({ success: false, error: `ไม่สามารถเปลี่ยนจาก "${order.status}" เป็น "${newStatus}"` }, { status: 400 })
  }

  const now = BigInt(Date.now())
  const field = statusToField[newStatus]

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { orderId }, data: { status: newStatus } })

      const updateData: Record<string, unknown> = { [field]: now, lastActor: actor }
      if (newStatus === "cancelled" && reason) updateData.cancelReason = reason

      const existing = await tx.orderTransition.findUnique({ where: { orderId } })
      if (existing) {
        await tx.orderTransition.update({ where: { orderId }, data: updateData })
      } else {
        await tx.orderTransition.create({
          data: {
            orderId,
            receivedAt: order.orderTime,
            [field]: now,
            lastActor: actor,
            ...(reason && newStatus === "cancelled" ? { cancelReason: reason } : {}),
          },
        })
      }

      if (newStatus === "delivered") {
        const gross = order.totalAmount
        const rate = commissionRates[order.channel] ?? 0
        const commission = gross * rate
        await tx.incomeRecord.create({
          data: {
            recordId: `INC-${Date.now()}`,
            source: "order", orderId, channel: order.channel,
            grossAmount: gross, commissionRate: rate,
            commissionAmount: commission, netAmount: gross - commission,
            vatAmount: 0, description: `ออเดอร์ ${orderId}`,
            recordedAt: now, recordedBy: actor,
          },
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Transition error:", err)
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการเปลี่ยนสถานะ" }, { status: 500 })
  }
}
