const Delaunator = require('delaunator')
const domla = require('domla')
const getusermedia = require('getusermedia')
const findCorners = require('./find-corners')
const centerOfTriangle = require('./center-of-triangle')

const RESOLUTION = [640, 320]
const [WIDTH, HEIGHT] = RESOLUTION
// const RATIO = HEIGHT / WIDTH
const POINT_AMOUNT = 1000

const { div, canvas, video } = domla

const el = canvas({style: 'visibility:hidden;'})
const context = el.getContext('2d')
const largeEl = canvas({style: 'position:fixed;top:0;left:0;'})
const largeContext = largeEl.getContext('2d')
const content = div()
const status = div()
const videoEl = video({style: 'width:640px;height:360px;visibility:hidden;'})
const layout = div({ className: 'textAlign-center container' },
  el,
  largeEl,
  videoEl
)

let mediaStream
const mediaOptions = {
  video: {
    mandatory: {
      maxWidth: WIDTH,
      maxHeight: HEIGHT
    }
  }
}

getusermedia(mediaOptions, function (err, stream) {
  if (err) alert(err.message)
  mediaStream = stream
})

function onImageLoad (err, img) {
  if (err) {
    status.innerText = err.message
    return
  }
  el.width = WIDTH / 2
  el.height = HEIGHT / 2
  largeEl.width = window.innerWidth
  largeEl.height = window.innerHeight
  const ratioY = largeEl.height / el.height
  const ratioX = largeEl.width / el.width

  largeContext.clearRect(0, 0, largeEl.width, largeEl.height)
  context.clearRect(0, 0, el.width, el.height)
  context.translate(el.width, 0)
  context.scale(-1, 1)
  context.drawImage(img, 0, 0, el.width, el.height)
  const corners = findCorners(el, 1, POINT_AMOUNT)
  const coords = corners.map(({x, y}) => [x * ratioX, y * ratioY])
  const triangles = new Delaunator(coords).triangles
  const build = []
  for (let i = 0; i < triangles.length; i += 3) {
    let x0 = coords[triangles[i]][0]
    let y0 = coords[triangles[i]][1]
    let x1 = coords[triangles[i + 1]][0]
    let y1 = coords[triangles[i + 1]][1]
    let x2 = coords[triangles[i + 2]][0]
    let y2 = coords[triangles[i + 2]][1]
    let center = centerOfTriangle(x0, y0, x1, y1, x2, y2)
    let pixel = context.getImageData(center[0] / ratioX, center[1] / ratioY, 1, 1)
    let data = pixel.data
    let rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
    build.push(function () {
      largeContext.beginPath()
      largeContext.moveTo(x0, y0)
      largeContext.lineTo(x1, y1)
      largeContext.lineTo(x2, y2)
      largeContext.fillStyle = rgb
      largeContext.fill()
    })
  }
  context.clearRect(0, 0, el.width, el.height)
  build.forEach(fn => fn())
}

function captureImage () {
  const url = largeEl.toDataURL('image/png')
  const newImg = new window.Image()
  newImg.src = url
  newImg.style = 'max-width:100%'
  status.innerText = ''
  content.innerHTML = ''
  content.appendChild(newImg)
}

function loadImage (src, callback) {
  status.innerText = 'loading image'
  const img = new window.Image()
  img.src = src
  img.onload = callback.bind(null, null, img)
  img.onerror = callback
}

document.addEventListener('DOMContentLoaded', function () {
  document.body.appendChild(layout)
})

function draw () {
  if (mediaStream && !videoEl.src) {
    videoEl.src = window.URL.createObjectURL(mediaStream)
    videoEl.play()
  }

  if (videoEl.src) {
    onImageLoad(null, videoEl)
  }
  window.requestAnimationFrame(draw)
}

draw()
