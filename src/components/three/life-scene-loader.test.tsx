import { render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dynamicScene = vi.hoisted(() => ({ throws: false }))

vi.mock("next/dynamic", () => ({
  default: () =>
    function DynamicSceneMock() {
      if (dynamicScene.throws) throw new Error("webgl failed")
      return <div data-testid="life-scene" />
    },
}))

import { LifeSceneLoader } from "./life-scene-loader"
import { LifeScenePoster } from "./life-scene-poster"

function setMedia({ mobile = false, reduced = false } = {}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("max-width") ? mobile : reduced,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  )
}

describe("LifeSceneLoader", () => {
  beforeEach(() => {
    dynamicScene.throws = false
    setMedia()
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as never
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("keeps Yellow out of the static poster fallback", () => {
    const { container } = render(<LifeScenePoster />)

    expect(container.innerHTML).not.toContain("--life-insight")
  })

  it("shows the poster when reduced motion is enabled", () => {
    setMedia({ reduced: true })
    render(<LifeSceneLoader />)
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("shows the poster on a mobile viewport", () => {
    setMedia({ mobile: true })
    render(<LifeSceneLoader />)
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("loads the scene only on a motion-enabled WebGL desktop", async () => {
    render(<LifeSceneLoader />)
    await waitFor(() =>
      expect(screen.getByTestId("life-scene")).toBeInTheDocument()
    )
  })

  it("keeps the poster when WebGL is unavailable", async () => {
    const getContext = vi.mocked(HTMLCanvasElement.prototype.getContext)
    getContext.mockReturnValue(null)
    render(<LifeSceneLoader />)
    await waitFor(() => expect(getContext).toHaveBeenCalled())
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
    expect(screen.queryByTestId("life-scene")).not.toBeInTheDocument()
  })

  it("returns to the poster when the dynamic scene throws", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined)
    dynamicScene.throws = true
    render(<LifeSceneLoader />)
    await waitFor(() => expect(consoleError).toHaveBeenCalled())
    expect(screen.getByTestId("life-scene-poster")).toBeInTheDocument()
  })
})
