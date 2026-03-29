import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/finance?period=today|week|month|all
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "all"

  const now = new Date()
  let startDate: number | null = null

  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    startDate = start.getTime()
  } else if (period === "week") {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
    const start = new Date(now.getFullYear(), now.getMonth(), diff)
    startDate = start.getTime()
  } else if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    startDate = start.getTime()
  }

  const incomeWhere = startDate ? { recordedAt: { gte: BigInt(startDate) } } : {}
  const expenseWhere = startDate ? { recordedAt: { gte: BigInt(startDate) } } : {}

  const [incomes, expenses] = await Promise.all([
    prisma.incomeRecord.findMany({ where: incomeWhere, orderBy: { recordedAt: "desc" } }),
    prisma.expenseRecord.findMany({ where: expenseWhere, orderBy: { recordedAt: "desc" } }),
  ])

  const totalIncome = incomes.reduce((s, r) => s + r.netAmount, 0)
  const totalExpense = expenses.reduce((s, r) => s + r.amount, 0)

  return NextResponse.json({
    incomes: incomes.map((r) => ({ ...r, recordedAt: Number(r.recordedAt) })),
    expenses: expenses.map((r) => ({ ...r, recordedAt: Number(r.recordedAt), date: Number(r.date) })),
    summary: {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      orderCount: incomes.filter((r) => r.source === "order").length,
    },
  })
}
