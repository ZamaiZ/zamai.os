import "server-only"

import DOMPurify from "isomorphic-dompurify"

export const MUSCLE_GROUP_ICON_SVG_MAX_CHARS = 32_768

const SVG_TAGS = [
  "svg",
  "path",
  "g",
  "circle",
  "rect",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "defs",
  "clipPath",
  "mask",
  "title",
] as const

const SVG_ATTRS = [
  "viewBox",
  "xmlns",
  "d",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "points",
  "fill",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "fill-rule",
  "clip-rule",
  "transform",
  "opacity",
  "aria-hidden",
  "role",
  "width",
  "height",
] as const

function minifySvg(svg: string): string {
  return svg
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s{2,}/g, " ")
    .trim()
}

function normalizePaint(value: string): string {
  const trimmed = value.trim().toLowerCase()
  if (
    trimmed === "none" ||
    trimmed === "currentcolor" ||
    trimmed === "transparent"
  ) {
    return value.trim()
  }
  return "currentColor"
}

function normalizeSvgMarkup(svg: string): string {
  let next = svg.replace(
    /\s(fill|stroke)\s*=\s*(["'])(.*?)\2/gi,
    (_match, attr: string, quote: string, value: string) =>
      ` ${attr}=${quote}${normalizePaint(value)}${quote}`
  )

  next = next.replace(/<svg\b([^>]*)>/i, (_match, attrs: string) => {
    let nextAttrs = attrs.replace(/\s(width|height)\s*=\s*(["']).*?\2/gi, "")

    if (!/\saria-hidden\s*=/i.test(nextAttrs)) {
      nextAttrs += ' aria-hidden="true"'
    }
    if (!/\sviewBox\s*=/i.test(nextAttrs)) {
      nextAttrs += ' viewBox="0 0 24 24"'
    }
    if (!/\sfill\s*=/i.test(nextAttrs)) {
      nextAttrs += ' fill="currentColor"'
    }

    nextAttrs += ' width="100%" height="100%"'
    return `<svg${nextAttrs}>`
  })

  return next
}

export function processMuscleGroupIconSvg(raw: string): string {
  const input = raw.trim()

  if (!input) {
    throw new Error("SVG icon is required")
  }

  if (input.length > MUSCLE_GROUP_ICON_SVG_MAX_CHARS) {
    throw new Error("SVG icon exceeds the maximum size of 32KB")
  }

  if (!/<svg[\s>]/i.test(input)) {
    throw new Error("File must contain a valid SVG root element")
  }

  if (/<script[\s>]/i.test(input) || /\bon\w+\s*=/i.test(input)) {
    throw new Error("SVG contains disallowed content")
  }

  const sanitized = DOMPurify.sanitize(input, {
    USE_PROFILES: { svg: true, svgFilters: false },
    ADD_TAGS: [...SVG_TAGS],
    ADD_ATTR: [...SVG_ATTRS],
    FORBID_TAGS: ["script", "foreignObject", "iframe", "image", "use"],
    FORBID_ATTR: ["href", "xlink:href"],
  })

  if (!/<svg[\s>]/i.test(sanitized)) {
    throw new Error("SVG failed sanitization")
  }

  const normalized = normalizeSvgMarkup(sanitized)
  const minified = minifySvg(normalized)

  if (minified.length > MUSCLE_GROUP_ICON_SVG_MAX_CHARS) {
    throw new Error("SVG icon exceeds the maximum size after processing")
  }

  return minified
}
