import { byId } from './util'
import { Side } from './app/data'
import { Point } from './app/size'
import { app } from './app/app'
import { GroupElem } from './app/groupElem'

const appEl = byId('app', HTMLElement)
const canvas = byId('canvas', HTMLCanvasElement)
const saveButton = byId('save', HTMLButtonElement)
saveButton.addEventListener('click', clickSave)

let dpr = devicePixelRatio

app.canvasSizeChange.on(({ width, height }) => {
  canvas.style.width = appEl.style.width = width + 'px'
  canvas.style.height = appEl.style.height = height + 'px'
  canvas.width = width * dpr
  canvas.height = height * dpr
})

window.addEventListener('resize', () => {
  if (devicePixelRatio !== dpr) {
    dpr = devicePixelRatio
    const size = app.canvasSize
    canvas.width = size.width * dpr
    canvas.height = size.height * dpr
    paintCanvas(true)
  }
})

app.dataChange.on(() => {
  app.updateSizes()
  resize(false)
  paintCanvas()
})

appEl.innerHTML = ''
app.reset()

const frag = document.createDocumentFragment()
const groupsElems: GroupElem[] = []

app.eachGroup((groupId, group) => {
  const groupElem = new GroupElem(groupId, group)
  groupsElems.push(groupElem)
  frag.append(groupElem.getNode())
})

appEl.append(frag)
for (const groupElem of groupsElems) {
  groupElem.registerElements()
}

setTimeout(repaint)



if (module.hot) module.hot.addDisposeHandler(() => {
  saveButton.removeEventListener('click', clickSave)
  document.body.classList.remove('edit')
})

if (app.isEditing) {
  document.body.classList.add('edit')
}

export function clickSave(): void {
  console.log(app.getData())
  alert('Copy the string that was printed to the console and insert it into the `data/data.json` file!')
}

export function repaint(): void {
  app.dataChange.emit()
  app.updateSizes()
  paintCanvas()
}

export function resize(paint = true): void {
  const size = app.canvasSize
  const minSize = app.minimumCanvasSize()
  if (minSize.width !== size.width || minSize.height !== size.height) {
    app.canvasSize = minSize
    if (paint) paintCanvas(true)
  }
}

function paintCanvas(isCanvasCleared = false): void {
  if (!isCanvasCleared) {
    // noinspection SillyAssignmentJS
    canvas.width = canvas.width
  }

  const ctx = canvas.getContext('2d')
  if (ctx == null) throw new Error('CanvasRenderingContext2d is null')
  ctx.lineWidth = 1.2 * dpr
  ctx.strokeStyle = '#333333'
  ctx.fillStyle = '#333333'

  app.eachConnection((connId, conn) => {
    const from = app.elemSizeOf(conn.from).sideCenter(conn.fromSide)
    const to = app.elemSizeOf(conn.to).sideCenter(conn.toSide)

    ctx.moveTo(from.x * dpr, from.y * dpr)
    if (conn.points != null) {
      for (const point of conn.points) {
        let p: { x: number; y: number } = point

        if (point.relative === 'from') {
          p = { x: from.x + point.x, y: from.y + point.y }
        } else if (point.relative === 'to') {
          p = { x: to.x + point.x, y: to.y + point.y }
        }

        ctx.lineTo(p.x * dpr, p.y * dpr)
      }
    }
    ctx.lineTo(to.x * dpr, to.y * dpr)
    ctx.stroke()
    drawArrow(ctx, conn.toSide, to)
  })
}

function drawArrow(ctx: CanvasRenderingContext2D, side: Side, to: Point): void {
  ctx.beginPath()
  ctx.moveTo(to.x * dpr, to.y * dpr)
  switch (side) {
    case 'west':
      ctx.lineTo((to.x - 10) * dpr, (to.y - 6) * dpr)
      ctx.lineTo((to.x - 10) * dpr, (to.y + 6) * dpr)
      break
    case 'east':
      ctx.lineTo((to.x + 10) * dpr, (to.y - 6) * dpr)
      ctx.lineTo((to.x + 10) * dpr, (to.y + 6) * dpr)
      break
    case 'north':
      ctx.lineTo((to.x + 6) * dpr, (to.y - 10) * dpr)
      ctx.lineTo((to.x - 6) * dpr, (to.y - 10) * dpr)
      break
    case 'south':
      ctx.lineTo((to.x + 6) * dpr, (to.y + 10) * dpr)
      ctx.lineTo((to.x - 6) * dpr, (to.y + 10) * dpr)
      break
  }
  ctx.fill()
  ctx.closePath()
}
