import { describe, it, expect, beforeEach } from "vitest"
import {
  initializeOrderState,
  getValidTransitions,
  transitionOrderState,
} from "../StateMachine"
import type { OrderState } from "@restaurant/types"

describe("initializeOrderState", () => {
  it("creates state with received status", () => {
    const state = initializeOrderState("ORD-1", 1000)
    expect(state.currentStatus).toBe("received")
    expect(state.history).toHaveLength(0)
    expect(state.orderId).toBe("ORD-1")
  })
})

describe("getValidTransitions", () => {
  it("received → confirmed, cancelled", () => {
    expect(getValidTransitions("received")).toEqual(["confirmed", "cancelled"])
  })

  it("confirmed → preparing, cancelled", () => {
    expect(getValidTransitions("confirmed")).toEqual(["preparing", "cancelled"])
  })

  it("preparing → ready, cancelled", () => {
    expect(getValidTransitions("preparing")).toEqual(["ready", "cancelled"])
  })

  it("ready → pickedUp, cancelled", () => {
    expect(getValidTransitions("ready")).toEqual(["pickedUp", "cancelled"])
  })

  it("pickedUp → delivered only", () => {
    expect(getValidTransitions("pickedUp")).toEqual(["delivered"])
  })

  it("delivered → nothing (Req 5.4)", () => {
    expect(getValidTransitions("delivered")).toEqual([])
  })

  it("cancelled → nothing (Req 5.4)", () => {
    expect(getValidTransitions("cancelled")).toEqual([])
  })
})

describe("transitionOrderState", () => {
  let state: OrderState

  beforeEach(() => {
    state = initializeOrderState("ORD-1", 1000)
  })

  it("valid transition: received → confirmed (Req 5.1)", () => {
    const result = transitionOrderState(state, "confirmed", "staff1", 2000)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.state.currentStatus).toBe("confirmed")
    }
  })

  it("adds history entry on transition (Req 5.3)", () => {
    const result = transitionOrderState(state, "confirmed", "staff1", 2000)
    if (!result.success) throw new Error("should succeed")
    expect(result.state.history).toHaveLength(1)
    expect(result.state.history[0]).toEqual({
      fromStatus: "received",
      toStatus: "confirmed",
      timestamp: 2000,
      actor: "staff1",
      reason: undefined,
    })
  })

  it("rejects invalid transition: received → ready (Req 5.2)", () => {
    const result = transitionOrderState(state, "ready", "staff1", 2000)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain("received")
      expect(result.error).toContain("ready")
    }
  })

  it("rejects transition from delivered (Req 5.4)", () => {
    // Walk through to delivered
    let s = state
    for (const next of ["confirmed", "preparing", "ready", "pickedUp", "delivered"] as const) {
      const r = transitionOrderState(s, next, "staff1", Date.now())
      if (!r.success) throw new Error(`transition to ${next} failed`)
      s = r.state
    }

    const result = transitionOrderState(s, "cancelled", "staff1", Date.now())
    expect(result.success).toBe(false)
  })

  it("rejects transition from cancelled (Req 5.4)", () => {
    const r = transitionOrderState(state, "cancelled", "staff1", 2000)
    if (!r.success) throw new Error("should succeed")

    const result = transitionOrderState(r.state, "received", "staff1", 3000)
    expect(result.success).toBe(false)
  })

  it("allows cancellation from received, confirmed, preparing, ready", () => {
    for (const status of ["received", "confirmed", "preparing", "ready"] as const) {
      const s: OrderState = { ...state, currentStatus: status }
      const result = transitionOrderState(s, "cancelled", "staff1", Date.now())
      expect(result.success).toBe(true)
    }
  })

  it("does not allow cancellation from pickedUp", () => {
    const s: OrderState = { ...state, currentStatus: "pickedUp" }
    const result = transitionOrderState(s, "cancelled", "staff1", Date.now())
    expect(result.success).toBe(false)
  })

  it("history grows with each transition (Req 5.3)", () => {
    let s = state
    const transitions = ["confirmed", "preparing", "ready"] as const
    for (let i = 0; i < transitions.length; i++) {
      const r = transitionOrderState(s, transitions[i], "staff1", 2000 + i)
      if (!r.success) throw new Error("should succeed")
      s = r.state
      expect(s.history).toHaveLength(i + 1)
    }
  })

  it("includes reason in history when provided", () => {
    const result = transitionOrderState(state, "cancelled", "staff1", 2000, "ลูกค้ายกเลิก")
    if (!result.success) throw new Error("should succeed")
    expect(result.state.history[0].reason).toBe("ลูกค้ายกเลิก")
  })
})
