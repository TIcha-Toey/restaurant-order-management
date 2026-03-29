import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// POST /api/finance/expenses — บันทึกรายจ่าย
export async function POST(req: Request) {
  const { category, amount, description, vendor, isRecurring, recordedBy } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ success: false, error: "จำนวนเงินต้องมากกว่า 0" }, { status: 400 })
  }
  if (!description?.trim()) {
    return NextResponse.json({ success: false, error: "กรุณากรอกรายละเอียด" }, { status: 400 })
  }

  const record = await prisma.expenseRecord.create({
    data: {
      recordId: `EXP-${Date.now()}`,
      category,
      amount,
      vatAmount: 0,
      description,
      date: BigInt(Date.now()),
      vendor: vendor || null,
      isRecurring: isRecurring ?? false,
      recordedAt: BigInt(Date.now()),
      recordedBy: recordedBy || "owner",
    },
  })

  return NextResponse.json({ success: true, record: { ...record, date: Number(record.date), recordedAt: Number(record.recordedAt) } })
}

// DELETE /api/finance/expenses?id=xxx
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const recordId = searchParams.get("id")
  if (!recordId) return NextResponse.json({ success: false, error: "ต้องระบุ id" }, { status: 400 })

  try {
    await prisma.expenseRecord.delete({ where: { recordId } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: "ไม่พบรายจ่าย" }, { status: 404 })
  }
}
