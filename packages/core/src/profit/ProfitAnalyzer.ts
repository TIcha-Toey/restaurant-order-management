/**
 * @module ProfitAnalyzer
 * @description วิเคราะห์กำไร GP, ราคาขายจริง, กำไรสุทธิ ต่อเมนู/ออเดอร์/ช่องทาง
 *
 * Requirements: 11.1-11.6, 12.1-12.4, 13.1-13.6
 */

import type {
  ChannelSource, UnifiedOrder, MenuItem, DatePeriod,
  ItemProfitAnalysis, OrderProfitAnalysis, ChannelProfitAnalysis,
} from "@restaurant/types"

/**
 * คำนวณ GP% ของเมนู — Req 11.1, 11.2, 11.3, 11.4, 11.5
 */
export function calculateItemGP(item: { unitPrice: number; costPrice: number }): {
  gpPercentage: number; grossProfitPerUnit: number
} {
  const grossProfitPerUnit = item.unitPrice - item.costPrice // Req 11.2
  const gpPercentage = item.unitPrice > 0
    ? (grossProfitPerUnit / item.unitPrice) * 100 // Req 11.1
    : 0
  return { gpPercentage, grossProfitPerUnit }
}

/**
 * ดึงเมนูที่ GP% ต่ำกว่า threshold — Req 11.6
 */
export function getLowGPItems(
  items: ItemProfitAnalysis[], threshold: number
): ItemProfitAnalysis[] {
  return items.filter((i) => i.gpPercentage < threshold)
}

/**
 * คำนวณราคาขายจริง — Req 12.1, 12.3
 */
export function calculateActualSellingPrice(
  totalSellingPrice: number,
  commissionAmount: number,
  vatAmount: number
): number {
  return totalSellingPrice - commissionAmount - vatAmount // Req 12.1
}

/**
 * วิเคราะห์กำไรต่อออเดอร์ — Req 13.1, 13.2, 13.3
 */
export function analyzeOrderProfit(
  order: UnifiedOrder,
  commissionRate: number,
  isVATRegistered: boolean
): OrderProfitAnalysis {
  const totalSellingPrice = order.totalAmount
  const totalCostPrice = order.totalCost
  const grossProfit = totalSellingPrice - totalCostPrice // Req 13.1
  const gpPercentage = totalSellingPrice > 0 ? (grossProfit / totalSellingPrice) * 100 : 0

  const commissionAmount = totalSellingPrice * commissionRate
  const vatAmount = isVATRegistered ? totalSellingPrice * 7 / 107 : 0
  const actualSellingPrice = calculateActualSellingPrice(totalSellingPrice, commissionAmount, vatAmount)
  const netProfit = actualSellingPrice - totalCostPrice // Req 13.2
  const netProfitMargin = totalSellingPrice > 0 ? (netProfit / totalSellingPrice) * 100 : 0 // Req 13.3

  const items: ItemProfitAnalysis[] = order.items.map((item) => {
    const gp = calculateItemGP(item)
    return {
      itemId: item.itemId, name: item.name, category: "",
      unitPrice: item.unitPrice, costPrice: item.costPrice,
      gpPercentage: gp.gpPercentage, grossProfitPerUnit: gp.grossProfitPerUnit,
      totalQuantitySold: item.quantity,
      totalRevenue: item.unitPrice * item.quantity,
      totalCost: item.costPrice * item.quantity,
      totalGrossProfit: gp.grossProfitPerUnit * item.quantity,
    }
  })

  return {
    orderId: order.orderId, channel: order.channel, items,
    totalSellingPrice, totalCostPrice, grossProfit, gpPercentage,
    commissionAmount, vatAmount, actualSellingPrice, netProfit, netProfitMargin,
  }
}

/**
 * วิเคราะห์กำไรแยกตามช่องทาง — Req 13.4
 * รวมเฉพาะออเดอร์ "delivered" ในช่วงเวลา
 */
export function analyzeChannelProfit(
  orders: UnifiedOrder[],
  commissionRates: Record<ChannelSource, number>,
  isVATRegistered: boolean,
  period: DatePeriod
): ChannelProfitAnalysis[] {
  const delivered = orders.filter(
    (o) => o.status === "delivered" && o.orderTime >= period.startDate && o.orderTime <= period.endDate
  )

  const channels: ChannelSource[] = ["grabFood", "lineMan", "shopeeFood", "walkIn", "website"]

  return channels.map((ch) => {
    const chOrders = delivered.filter((o) => o.channel === ch)
    const analyses = chOrders.map((o) => analyzeOrderProfit(o, commissionRates[ch] ?? 0, isVATRegistered))

    const totalOrders = chOrders.length
    const totalSellingPrice = analyses.reduce((s, a) => s + a.totalSellingPrice, 0)
    const totalCostPrice = analyses.reduce((s, a) => s + a.totalCostPrice, 0)
    const totalGrossProfit = analyses.reduce((s, a) => s + a.grossProfit, 0)
    const totalCommission = analyses.reduce((s, a) => s + a.commissionAmount, 0)
    const totalVAT = analyses.reduce((s, a) => s + a.vatAmount, 0)
    const totalActualSellingPrice = analyses.reduce((s, a) => s + a.actualSellingPrice, 0)
    const totalNetProfit = analyses.reduce((s, a) => s + a.netProfit, 0)

    return {
      channel: ch, period, totalOrders, totalSellingPrice, totalCostPrice,
      totalGrossProfit,
      averageGPPercentage: totalSellingPrice > 0 ? (totalGrossProfit / totalSellingPrice) * 100 : 0,
      totalCommission, totalVAT, totalActualSellingPrice, totalNetProfit,
      netProfitMargin: totalSellingPrice > 0 ? (totalNetProfit / totalSellingPrice) * 100 : 0,
      topProfitItems: [], lowGPItems: [],
    }
  }).filter((ch) => ch.totalOrders > 0)
}

/**
 * สรุปยอดแยกตามช่องทาง — Req 10.1, 10.2, 10.4, 10.5
 */
export function computeChannelRevenue(
  orders: UnifiedOrder[],
  commissionRates: Record<ChannelSource, number>,
  period: DatePeriod
) {
  const delivered = orders.filter(
    (o) => o.status === "delivered" && o.orderTime >= period.startDate && o.orderTime <= period.endDate
  )

  const channels: ChannelSource[] = ["grabFood", "lineMan", "shopeeFood", "walkIn", "website"]

  const summaries = channels.map((ch) => {
    const chOrders = delivered.filter((o) => o.channel === ch)
    const grossRevenue = chOrders.reduce((s, o) => s + o.totalAmount, 0)
    const rate = commissionRates[ch] ?? 0
    const totalCommission = grossRevenue * rate
    const netRevenue = grossRevenue - totalCommission
    const totalOrders = chOrders.length
    return {
      channel: ch, period, totalOrders, grossRevenue, totalCommission, netRevenue,
      averageOrderValue: totalOrders > 0 ? grossRevenue / totalOrders : 0,
    }
  })

  const totalGrossRevenue = summaries.reduce((s, c) => s + c.grossRevenue, 0)
  const totalNetRevenue = summaries.reduce((s, c) => s + c.netRevenue, 0)
  const totalCommissionPaid = summaries.reduce((s, c) => s + c.totalCommission, 0)
  const best = summaries.reduce((a, b) => b.netRevenue > a.netRevenue ? b : a, summaries[0])

  return {
    channels: summaries.filter((c) => c.totalOrders > 0),
    bestChannel: best?.channel ?? "walkIn",
    totalGrossRevenue, totalNetRevenue, totalCommissionPaid,
  }
}
