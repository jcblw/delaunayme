function colorDistance (r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2
  const dg = g1 - g2
  const db = b1 - b2
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function sumDistance (imageData, x, y, n) {
  const pixels = imageData.data
  const imageSizeX = imageData.width
  const imageSizeY = imageData.height

  // position information
  let px, py, i, j, pos

  // distance accumulator
  let dSum = 0

  // colors
  const r1 = pixels[4 * (imageSizeX * y + x) + 0]
  const g1 = pixels[4 * (imageSizeX * y + x) + 1]
  const b1 = pixels[4 * (imageSizeX * y + x) + 2]
  let r2, g2, b2

  for (i = -n; i <= n; i += 1) {
    for (j = -n; j <= n; j += 1) {
      // Tile the image if we are at an end
      px = (x + i) % imageSizeX
      px = (px > 0) ? px : -px
      py = (y + j) % imageSizeY
      py = (py > 0) ? py : -py

      // Get the colors of this pixel
      pos = 4 * (imageSizeX * py + px)
      r2 = pixels[pos + 0]
      g2 = pixels[pos + 1]
      b2 = pixels[pos + 2]

      // Work with the pixel
      dSum += colorDistance(r1, g1, b1, r2, g2, b2)
    }
  }

  return dSum
}

function computeDistanceData (imageData, n) {
  const imageSizeX = imageData.width
  const imageSizeY = imageData.height

  let x, y
  const data = []
  for (x = 0; x < imageSizeX; x += 1) {
    for (y = 0; y < imageSizeY; y += 1) {
      data.push({
        x: x,
        y: y,
        d: sumDistance(imageData, x, y, n)
      })
    }
  }

  return data
}

function byDecreasingD (a, b) {
  return b.d - a.d
}

module.exports = function findCorners (canvas, apertureSize, numPoints) {
  // Get the raw pixel data from the canvas
  const context = canvas.getContext('2d')
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

  // Compute and return the results
  const results = computeDistanceData(imageData, apertureSize)
  return results.sort(byDecreasingD).slice(0, numPoints)
}
