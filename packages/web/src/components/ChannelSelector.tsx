"use client"

import type { ChannelSource } from "@/lib/types"

const channels: { id: ChannelSource; label: string; emoji: string }[] = [
  { id: "grabFood", label: "GrabFood", emoji: "🟢" },
  { id: "lineMan", label: "LINE MAN", emoji: "🟤" },
  { id: "shopeeFood", label: "ShopeeFood", emoji: "🟠" },
  { id: "walkIn", label: "Walk-in", emoji: "🚶" },
  { id: "website", label: "Website", emoji: "🌐" },
]

interface Props {
  selected: ChannelSource | null
  onSelect: (channel: ChannelSource) => void
}

export default function ChannelSelector({ selected, onSelect }: Props) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-700 mb-4">
        1️⃣ เลือกช่องทาง
      </h2>
      <div className="grid grid-cols-5 gap-3">
        {channels.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => onSelect(ch.id)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-3 p-5 text-base font-bold transition-all
              ${selected === ch.id
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
              }`}
          >
            <span className="text-4xl">{ch.emoji}</span>
            <span>{ch.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
