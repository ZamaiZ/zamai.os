import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

vi.mock("@/components/three/life-scene-loader", () => ({
  LifeSceneLoader: () => <div data-testid="scene-boundary" />,
}))

import { LoginScreen } from "./login-screen"

describe("LoginScreen", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("renders labelled credentials and the demonstrative disclosure", () => {
    render(<LoginScreen />)

    expect(screen.getByLabelText("E-mail")).toHaveAttribute("type", "email")
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password")
    expect(
      screen.getByText("Demonstração: nenhuma credencial é enviada.")
    ).toBeInTheDocument()
  })

  it("shows field-level errors for an invalid submission", async () => {
    render(<LoginScreen />)

    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "eduardo" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }))

    expect(await screen.findByText("Digite um e-mail válido.")).toBeVisible()
    expect(screen.getByText("Digite sua senha.")).toBeVisible()
  })

  it("toggles password visibility with an accessible control", () => {
    render(<LoginScreen />)

    const password = screen.getByLabelText("Senha")
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }))

    expect(password).toHaveAttribute("type", "text")
    expect(
      screen.getByRole("button", { name: "Ocultar senha" })
    ).toBeInTheDocument()
  })

  it("keeps a valid submission local and on the same document", async () => {
    const fetchSpy = vi.fn()
    vi.stubGlobal("fetch", fetchSpy)
    const pushState = vi.spyOn(window.history, "pushState")
    const storage = vi.spyOn(Storage.prototype, "setItem")

    render(<LoginScreen />)
    fireEvent.change(screen.getByLabelText("E-mail"), {
      target: { value: "eduardo@example.com" },
    })
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "segredo" },
    })
    fireEvent.submit(screen.getByRole("form", { name: "Entrar no Life" }))

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    )
    expect(pushState).not.toHaveBeenCalled()
    expect(storage).not.toHaveBeenCalled()
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})
