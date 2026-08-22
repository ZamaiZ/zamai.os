import { act, render, screen } from "@testing-library/react"
import { createElement } from "react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@react-three/fiber", () => ({
  Canvas: () =>
    createElement("div", { "data-testid": "life-canvas", "aria-hidden": true }),
  useFrame: vi.fn(),
}))

vi.mock("@react-three/drei", () => ({
  Line: () => null,
  Sparkles: () => null,
}))

import { LIFE_PHASES, phaseAtElapsed } from "./life-scene-config"
import { LifeScene } from "./life-scene"

describe("life scene cycle", () => {
  afterEach(() => vi.useRealTimers())

  it("loops through the five conceptual phases", () => {
    expect(LIFE_PHASES).toEqual([
      "breathe",
      "understand",
      "align",
      "sharpen",
      "integrate",
    ])
    expect(phaseAtElapsed(0)).toBe("breathe")
    expect(phaseAtElapsed(6)).toBe("understand")
    expect(phaseAtElapsed(12)).toBe("align")
    expect(phaseAtElapsed(18)).toBe("sharpen")
    expect(phaseAtElapsed(24)).toBe("integrate")
    expect(phaseAtElapsed(30)).toBe("breathe")
  })

  it("renders a decorative canvas and advances the visible phase label", () => {
    vi.useFakeTimers()
    render(createElement(LifeScene))

    expect(screen.getByTestId("life-canvas")).toBeInTheDocument()
    expect(screen.getByText("breathe")).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(6000))

    expect(screen.getByText("understand")).toBeInTheDocument()
  })
})
