import { byId, div, icon, makeNode } from './util'
import { getData, Group, GroupChild, Side } from './data'
import { Point, Size } from './size'
import { editableChild, editableGroup, editChildStatus } from './edit'

export const data = getData()

const app = byId('app', HTMLElement)
const canvas = byId('canvas', HTMLCanvasElement)
let dpr = devicePixelRatio

const items: { [key: string]: HTMLElement } = {}
let idCache: { [id: string]: Size } = {};

((): void => {
  const width = data.canvas.width
  const height = data.canvas.height

  canvas.style.width = app.style.width = width + 'px'
  canvas.style.height = app.style.height = height + 'px'
  canvas.width = width * dpr
  canvas.height = height * dpr

  window.addEventListener('resize', () => {
    if (devicePixelRatio !== dpr) {
      dpr = devicePixelRatio
      canvas.width = data.canvas.width * dpr
      canvas.height = data.canvas.height * dpr
      paintCanvas(true)
    }
  })
})()

export function deleteNode(id: string, group: Group): void {
  delete items[id]
  delete data.groups[id]
  delete idCache[id]

  if (group.children != null) {
    for (const childId in group.children) if (group.children.hasOwnProperty(childId)) {
      delete items[childId]
      delete idCache[childId]
    }
  }

  for (const connId in data.connections) if (data.connections.hasOwnProperty(connId)) {
    const conn = data.connections[connId]

    if (conn.from === id || conn.to === id) {
      delete data.connections[connId]
    }
  }

  updateSizes()
  resize(false)
  paintCanvas()
}

function configureApp(): void {
  app.innerHTML = ''
  idCache = {}

  const frag = document.createDocumentFragment()

  for (const groupId in data.groups) if (data.groups.hasOwnProperty(groupId)) {
    const group: Group = data.groups[groupId]
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
        const child: GroupChild = group.children[childId]
        const iel = div(`child ${child.status}`, '')

        const iconEl = makeNode('div', 'child-icon', icon(child.status), { title: child.status })
        iconEl.addEventListener('click', () => editChildStatus(child, iel))
        iel.append(iconEl)

        if (child.href == null) {
          iel.append(div('child-inner', child.label))
        } else {
          iel.append(makeNode('a', 'child-inner', child.label, { href: child.href }))
        }
        items[childId] = iel

        editableChild(child, iel.lastElementChild as HTMLElement)
        el.append(iel)
      }
    }
    items[groupId] = el

    frag.append(el)
  }

  app.append(frag)

  setTimeout(() => {
    updateSizes()
    paintCanvas()
  })
}
configureApp()

export function repaint(): void {
  updateSizes()
  paintCanvas()
}

export function resize(paint = true): void {
  let mx = 0
  let my = 0

  for (const id in idCache) if (idCache.hasOwnProperty(id)) {
    const c = idCache[id]
    mx = Math.max(mx, c.width + c.x)
    my = Math.max(my, c.height + c.y)
  }
  mx += 15
  my += 15

  if (mx !== data.canvas.width || my !== data.canvas.height) {
    data.canvas.width = mx
    data.canvas.height = my

    canvas.width = data.canvas.width * dpr
    canvas.height = data.canvas.height * dpr
    canvas.style.width = app.style.width = data.canvas.width + 'px'
    canvas.style.height = app.style.height = data.canvas.height + 'px'

    if (paint) paintCanvas(true)
  }
}

function updateSizes(): void {
  const sx = window.scrollX
  const sy = window.scrollY

  for (const itemId in items) if (items.hasOwnProperty(itemId)) {
    idCache[itemId] = relativeRect(items[itemId]).shift(sx, sy)
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

  for (const connId in data.connections) if (data.connections.hasOwnProperty(connId)) {
    const conn = data.connections[connId]

    const from = idCache[conn.from].sideCenter(conn.fromSide)
    const to = idCache[conn.to].sideCenter(conn.toSide)

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
  }
}

function relativeRect(elem: HTMLElement): Size {
  const rect = elem.getBoundingClientRect()

  if (elem.classList.contains('node')) {
    const inner = elem.querySelector('.node-title')
    return inner == null
      ? Size.from(rect)
      : Size.from(inner.getBoundingClientRect(), rect.height)
  } else {
    return Size.from(rect)
  }
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
