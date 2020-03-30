import { byId, div, icon, makeNode, uuid } from './util'
import { Group, GroupChild, Side } from './data'
import { Point } from './size'
import { editableChild, editableGroup, editChildStatus } from './edit'
import { app } from './app'

const appEl = byId('app', HTMLElement)
const canvas = byId('canvas', HTMLCanvasElement)
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

export function addChild(group: Group, elem: HTMLElement): string {
  const id = uuid('c')
  if (group.children == null) group.children = {}
  group.children[id] = {
    label: '',
    status: 'unassigned',
  }
  const childElem = createGroupChild(id, group.children[id])
  elem.append(childElem)
  return id
}

function createGroupChild(id: string, child: GroupChild): HTMLElement {
  const elem = div(`child ${child.status}`, '')

  const iconEl = makeNode('div', 'child-icon', icon(child.status), { title: child.status })
  iconEl.addEventListener('click', () => editChildStatus(child, elem))
  elem.append(iconEl)

  if (child.href == null) {
    elem.append(div('child-inner', child.label))
  } else {
    elem.append(makeNode('a', 'child-inner', child.label, { href: child.href }))
  }
  app.setElem(id, elem)
  editableChild(child, elem.lastElementChild as HTMLElement)
  return elem
}

function configureApp(): void {
  appEl.innerHTML = ''
  app.reset()

  const frag = document.createDocumentFragment()

  app.eachGroup((groupId, group) => {
    const el = document.createElement('div')
    el.className = 'node'
    el.style.left = group.x + 'px'
    el.style.top = group.y + 'px'
    el.style.width = group.width + 'px'

    const title = div('node-title', group.title)
    editableGroup(groupId, group, title)
    el.append(title)

    if (group.children != null) {
      for (const childId in group.children) if (group.children.hasOwnProperty(childId)) {
        const childElem = createGroupChild(childId, group.children[childId])
        el.append(childElem)
      }
    }
    app.setElem(groupId, el)

    frag.append(el)
  })

  appEl.append(frag)

  setTimeout(repaint)
}
configureApp()

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
