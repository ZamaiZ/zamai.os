"use client"

import { Component, useEffect, useState, type ReactNode } from "react"
import dynamic from "next/dynamic"

import { LifeScenePoster } from "./life-scene-poster"

const DynamicLifeScene = dynamic(
  () => import("./life-scene").then((module) => module.LifeScene),
  {
    ssr: false,
    loading: () => <LifeScenePoster />,
  }
)

export function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

class SceneErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? <LifeScenePoster /> : this.props.children
  }
}

export function LifeSceneLoader() {
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)")
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () =>
      setCanRender(!mobile.matches && !reduced.matches && supportsWebGL())

    sync()
    mobile.addEventListener("change", sync)
    reduced.addEventListener("change", sync)

    return () => {
      mobile.removeEventListener("change", sync)
      reduced.removeEventListener("change", sync)
    }
  }, [])

  return (
    <SceneErrorBoundary key={canRender ? "scene" : "poster"}>
      {canRender ? <DynamicLifeScene /> : <LifeScenePoster />}
    </SceneErrorBoundary>
  )
}
