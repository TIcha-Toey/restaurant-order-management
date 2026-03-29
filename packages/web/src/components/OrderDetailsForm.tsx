"use client"

import type { OrderDetails } from "@/lib/types"

interface Props {
  details: OrderDetails
  onChange: (details: OrderDetails) => void
  disabled: boolean
}

export default function OrderDetailsForm({ details, onChange, disabled }: Props) {
  const update = (field: keyof OrderDetails, value: string) => {
    onChange({ ...details, [field]: value || undefined })
  }

  return (
    <div className={disabled ? "pointer-events-none opacity-40" : ""}>
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        3️⃣ รายละเอียด
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-base text-gray-600 mb-2 font-semibold">ชื่อลูกค้า</label>
          <input
            id="customerName"
            type="text"
            value={details.customerName || ""}
            onChange={(e) => update("customerName", e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-3 focus:ring-blue-400"
            placeholder="ชื่อลูกค้า (ไม่บังคับ)"
            disabled={disabled}
          />
        </div>
        <div>
          <label htmlFor="externalOrderId" className="block text-base text-gray-600 mb-2 font-semibold">เลขออเดอร์จาก App</label>
          <input
            id="externalOrderId"
            type="text"
            value={details.externalOrderId || ""}
            onChange={(e) => update("externalOrderId", e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-3 focus:ring-blue-400"
            placeholder="เช่น GRAB-ABC123"
            disabled={disabled}
          />
        </div>
        <div className="col-span-2">
          <label htmlFor="notes" className="block text-base text-gray-600 mb-2 font-semibold">หมายเหตุ</label>
          <textarea
            id="notes"
            value={details.notes || ""}
            onChange={(e) => update("notes", e.target.value)}
            className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-lg focus:outline-none focus:ring-3 focus:ring-blue-400"
            placeholder="หมายเหตุเพิ่มเติม"
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
