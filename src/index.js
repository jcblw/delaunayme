const React = require('react')
const ReactDOM = require('react-dom')
const Delaunator = require('delaunator')
const getusermedia = require('getusermedia')
const Application = require('./components/application')
const findCorners = require('./lib/find-corners')
const centerOfTriangle = require('./lib/center-of-triangle')

const RESOLUTION = [640, 320]
const [WIDTH, HEIGHT] = RESOLUTION
// const RATIO = HEIGHT / WIDTH
const POINT_AMOUNT = 1000

const appEl = document.getElementById('app')
let el
let context
let mainCanvas
let mainContext
let videoEl

function onRef(ref, type) {
  if (!ref) {
    return
  }
  switch(type) {
    case 'video':
      videoEl = ref
      break
    case 'mainCanvas':
      mainCanvas = ref
      mainContext = mainCanvas.getContext('2d')
      break
    case 'processingCanvas':
      el = ref
      context = mainCanvas.getContext('2d')
      break
  }
}

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

function processFrame (err, img) {
  if (err) {
    status.innerText = err.message
    return
  }
  el.width = WIDTH / 2
  el.height = HEIGHT / 2
  videoEl.width = el.width
  videoEl.height = el.height
  mainCanvas.width = window.innerWidth
  mainCanvas.height = window.innerHeight
  const ratioY = mainCanvas.height / el.height
  const ratioX = mainCanvas.width / el.width

  mainContext.clearRect(0, 0, mainCanvas.width, mainCanvas.height)
  context.clearRect(0, 0, el.width, el.height)
  // context.translate(el.width / 2, 0)
  // context.scale(-1, 1)
  context.drawImage(img, 0, 0, el.width, el.height)
  const corners = findCorners(el, 1, POINT_AMOUNT)
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
}

function captureImage () {
  const url = mainCanvas.toDataURL('image/png')
  const newImg = new window.Image()
  newImg.src = url
  newImg.style = 'max-width:100%'
  status.innerText = ''
  content.innerHTML = ''
  content.appendChild(newImg)
}

let src;

function draw () {
  if (mediaStream && videoEl && !videoEl.src) {
    src = window.URL.createObjectURL(mediaStream)
  }

  if (videoEl && videoEl.src) {
    processFrame(null, videoEl)
  } else {
    ReactDOM.render(<Application onRef={onRef} src={src} />, appEl)
  }
  window.requestAnimationFrame(draw)
}


draw()
