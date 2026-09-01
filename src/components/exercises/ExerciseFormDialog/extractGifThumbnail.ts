export const EXERCISE_GIF_THUMB_MAX_PX = 480
export const EXERCISE_GIF_THUMB_QUALITY = 0.82

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Unable to decode GIF"))
    image.src = src
  })
}

function fitContain(width: number, height: number, max: number) {
  if (width <= 0 || height <= 0) {
    return { width: max, height: max }
  }

  const scale = Math.min(1, max / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

export async function extractGifThumbnail(file: File): Promise<Blob> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadImage(objectUrl)
    const size = fitContain(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      EXERCISE_GIF_THUMB_MAX_PX
    )

    const canvas = document.createElement("canvas")
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext("2d")
    if (!context) {
      throw new Error("Unable to create canvas")
    }

    context.drawImage(image, 0, 0, size.width, size.height)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (next) => {
          if (!next) {
            reject(new Error("Unable to encode thumbnail"))
            return
          }
          resolve(next)
        },
        "image/jpeg",
        EXERCISE_GIF_THUMB_QUALITY
      )
    })

    return blob
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
