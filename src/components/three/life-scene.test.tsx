import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ "aria-hidden": ariaHidden }: { "aria-hidden"?: boolean }) => (
    <div data-testid="life-canvas" aria-hidden={ariaHidden} />
  ),
  useFrame: vi.fn(),
}))

vi.mock("@react-three/drei", () => ({
  Line: () => null,
  Sparkles: () => null,
}))

import { LIFE_PHASES, orbitPoints, phaseAtElapsed } from "./life-scene-config"
import { LifeScene } from "./life-scene"

describe("life scene cycle", () => {
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

  it("represents orbit points as serializable coordinate tuples", () => {
    const points = orbitPoints(2)

    expect(points).toHaveLength(97)
    expect(points[0]).toEqual([2, 0, 0])
    expect(points[0]).toBeInstanceOf(Array)
  })

  it("renders a decorative canvas hidden from assistive technology", () => {
    render(<LifeScene />)

    expect(screen.getByTestId("life-canvas")).toHaveAttribute(
      "aria-hidden",
      "true"
    )
    expect(screen.queryByText("breathe")).not.toBeInTheDocument()
  })
})
