const Delaunator = require('delaunator')
const domla = require('domla')
const getusermedia = require('getusermedia')
const findCorners = require('./find-corners')
const centerOfTriangle = require('./center-of-triangle')

const { div, input, canvas, h1, h3 } = domla

const el = canvas()
const context = el.getContext('2d')
const fileInput = input({ type: 'file' })
const content = div()
const status = div()
const layout = div({ className: 'textAlign-center container' },
  h1({}, 'Delaunay Me'),
  h3({}, 'Upload your own image to add a delaunay effect'),
  fileInput,
  status,
  content
)

let mediaStream

getusermedia(function (err, stream) {
  if (err) alert(err.message)
  mediaStream = stream
})

fileInput.addEventListener('change', function () {
  const file = this.files[0]
  loadImage(URL.createObjectURL(file), onImageLoad)
}, false)

function onImageLoad (err, img) {
  if (err) {
    status.innerText = err.message
    return
  }
  status.innerText = 'appling effect'
  el.width = img.width
  el.height = img.height
  context.drawImage(img, 0, 0)
  const corners = findCorners(el, 1, 10000)
  const coords = corners.map(({x, y}) => [x, y])
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
    let pixel = context.getImageData(center[0], center[1], 1, 1)
    let data = pixel.data
    let rgb = `rgb(${data[0]}, ${data[1]}, ${data[2]})`
    build.push(function () {
      context.beginPath()
      context.moveTo(x0, y0)
      context.lineTo(x1, y1)
      context.lineTo(x2, y2)
      context.fillStyle = rgb
      context.fill()
    })
  }
  context.clearRect(0, 0, el.width, el.height)
  build.forEach(fn => fn())
  const url = el.toDataURL('image/png')
  const newImg = new Image()
  newImg.src = url
  newImg.style = 'max-width:100%'
  status.innerText = ''
  content.innerHTML = ''
  content.appendChild(newImg)
}

function loadImage (src, callback) {
  status.innerText = 'loading image'
  const img = new Image()
  img.src = src
  img.onload = callback.bind(null, null, img)
  img.onerror = callback
}

document.addEventListener('DOMContentLoaded', function () {
  document.body.appendChild(layout)
})

function draw () {
  if (mediaStream) {

  }
  setTimeout(
    requestAnimationFrame(draw),
    0
  )
}
