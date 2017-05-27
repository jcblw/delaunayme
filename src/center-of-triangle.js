function centerOfN (x1, x2, x3) {
  return (x1 + x2 + x3) / 3
}

module.exports = function centerOfTriangle (x1, y1, x2, y2, x3, y3) {
  return [centerOfN(x1, x2, x3), centerOfN(y1, y2, y3)]
}
