/**
 * Shared types สำหรับ frontend — mirror จาก @restaurant/types
 * (ใช้ local copy เพื่อไม่ต้อง link monorepo ตอนนี้)
 */

export type ChannelSource = "grabFood" | "lineMan" | "shopeeFood" | "walkIn" | "website"

export type OrderStatus = "received" | "confirmed" | "preparing" | "ready" | "pickedUp" | "delivered" | "cancelled"

export interface MenuItem {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  costPrice: number
  specialInstructions?: string
}

export interface MenuItemTemplate {
  itemId: string
  name: string
  category: string
  unitPrice: number
  costPrice: number
  isAvailable: boolean
  description?: string
}

export interface OrderDetails {
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  externalOrderId?: string
  notes?: string
}

export interface UnifiedOrder {
  orderId: string
  channel: ChannelSource
  externalOrderId?: string
  items: MenuItem[]
  totalAmount: number
  totalCost: number
  customerName?: string
  customerPhone?: string
  deliveryAddress?: string
  orderTime: number
  status: OrderStatus
  priorityScore: number
  notes?: string
  enteredBy: string
}
