import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** Temporary Apple home-screen icon. Replace with the brand assets in docs/pwa.md. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#247e8c",
          color: "#f7fffe",
          display: "flex",
          fontFamily: "sans-serif",
          fontSize: 94,
          fontWeight: 700,
          height: "100%",
          justifyContent: "center",
          letterSpacing: "-0.08em",
          width: "100%",
        }}
      >
        Z
      </div>
    ),
    size
  )
}
