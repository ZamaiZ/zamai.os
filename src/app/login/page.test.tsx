import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

vi.mock("@/components/three/life-scene-loader", () => ({
  LifeSceneLoader: () => <div data-testid="scene-boundary" />,
}))

import LoginPage, { metadata } from "./page"

describe("LoginPage", () => {
  it("renders the login heading and exports its static metadata", () => {
    render(<LoginPage />)

    expect(
      screen.getByRole("heading", { name: "Volte ao seu centro." })
    ).toBeInTheDocument()
    expect(metadata.title).toBe("Entrar | Life")
    expect(metadata.description).toBe("Acesse seu sistema pessoal Life.")
  })
})
