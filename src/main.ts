import { byId, div, icon, makeNode } from './util'
import { getData, Node, NodeChild, Side } from './data'
import { Point, Size } from './size'

const data = getData()

const app = byId('app', HTMLElement)
const canvas = byId('canvas', HTMLCanvasElement)
let dpr = devicePixelRatio

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
      canvas.width = width * dpr
      canvas.height = height * dpr
      repaint(true)
    }
  })
})()

function configureApp(): void {
  app.innerHTML = ''
  idCache = {}
  const items: { [key: string]: HTMLElement } = {}

  const frag = document.createDocumentFragment()

  for (const nodeId in data.nodes) if (data.nodes.hasOwnProperty(nodeId)) {
    const node: Node = data.nodes[nodeId]
    const el = document.createElement('div')
    el.className = 'node'
    el.style.left = node.x + 'px'
    el.style.top = node.y + 'px'
    el.style.width = node.width + 'px'

    const title = div('node-title', node.title)
    el.append(title)

    if (node.children != null) {
      for (const childId in node.children) if (node.children.hasOwnProperty(childId)) {
        const child: NodeChild = node.children[childId]
        const iel = div(`child ${child.status}`, '')
        iel.append(makeNode('div', 'child-icon', icon(child.status), { title: child.status }))

        if (child.href == null) {
          iel.append(div('child-inner', child.label))
        } else {
          iel.append(makeNode('a', 'child-inner', child.label, { href: child.href }))
        }
        items[childId] = iel

        el.append(iel)
      }
    }
    items[nodeId] = el

    frag.append(el)
  }

  app.append(frag)

  setTimeout(() => {
    const sx = window.scrollX
    const sy = window.scrollY

    for (const itemId in items) if (items.hasOwnProperty(itemId)) {
      idCache[itemId] = relativeRect(items[itemId]).shift(sx, sy)
    }
    repaint()
  })
}
configureApp()

function repaint(isCanvasCleared = false): void {
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

    console.log(from, to)

    ctx.moveTo(from.x * dpr, from.y * dpr)
    if (conn.points != null) {
      for (const point of conn.points) {
        let p: { x: number; y: number } = point

        if (point.relative === 'from') {
          p = { x: from.x + point.x, y: from.y + point.y }
        } else if (point.relative === 'to') {
          p = { x: to.x + point.x, y: to.y + point.y }
        }

        console.log(p)

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
