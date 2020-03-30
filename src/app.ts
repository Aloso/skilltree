import { Connection, getData, Group } from './data'
import { relativeRect, Size } from './size'
import { EventEmitter } from './eventEmitter'

export class App {
  static singleton = new App()

  readonly dataChange = new EventEmitter<void>()
  readonly canvasSizeChange = new EventEmitter<{ width: number; height: number }>()

  private readonly data = getData()
  private elements: { [key: string]: HTMLElement } = {}
  private sizes: { [key: string]: Size } = {}

  private constructor() {
    this.canvasSizeChange.emit(this.data.canvas)
    return
  }

  reset(): void {
    this.elements = {}
    this.sizes = {}
  }

  get canvasSize(): { width: number; height: number } {
    return this.data.canvas
  }
  set canvasSize(newSize: { width: number; height: number }) {
    this.data.canvas = newSize
    this.canvasSizeChange.emit(newSize)
  }

  minimumCanvasSize(): { width: number; height: number } {
    let width = 0
    let height = 0

    for (const id in this.sizes) if (this.sizes.hasOwnProperty(id)) {
      const c = this.sizes[id]
      width = Math.max(width, c.width + c.x)
      height = Math.max(height, c.height + c.y)
    }
    width += 15
    height += 15

    return { width, height }
  }

  elemSizeOf(id: string): Size {
    return this.sizes[id]
  }

  updateSizes(): void {
    const sx = window.scrollX
    const sy = window.scrollY

    for (const itemId in this.elements) if (this.elements.hasOwnProperty(itemId)) {
      this.sizes[itemId] = relativeRect(this.elements[itemId]).shift(sx, sy)
    }
  }

  eachGroup(callback: (id: string, group: Group) => void): void {
    // eslint-disable-next-line guard-for-in,@typescript-eslint/tslint/config
    for (const groupId in this.data.groups) {
      callback(groupId, this.data.groups[groupId])
    }
  }

  eachConnection(callback: (id: string, conn: Connection) => void): void {
    // eslint-disable-next-line guard-for-in,@typescript-eslint/tslint/config
    for (const connId in this.data.connections) {
      callback(connId, this.data.connections[connId])
    }
  }

  eachElem(callback: (id: string, elem: HTMLElement) => void): void {
    // eslint-disable-next-line guard-for-in,@typescript-eslint/tslint/config
    for (const elemId in this.elements) {
      callback(elemId, this.elements[elemId])
    }
  }

  deleteGroup(id: string): void {
    const group = this.data.groups[id]

    delete this.elements[id]
    delete this.data.groups[id]
    delete this.sizes[id]

    if (group.children != null) {
      for (const childId in group.children) if (group.children.hasOwnProperty(childId)) {
        delete this.elements[childId]
        delete this.sizes[childId]
      }
    }

    this.eachConnection((connId, conn) => {
      if (conn.from === id || conn.to === id) this.deleteConnection(connId, false)
    })

    this.dataChange.emit()
  }

  deleteConnection(id: string, emit = true): void {
    delete this.data.connections[id]
    if (emit) this.dataChange.emit()
  }

  getData(): string {
    return JSON.stringify(this.data, null, 2)
  }

  getElem(id: string): HTMLElement {
    return this.elements[id]
  }

  setElem(id: string, elem: HTMLElement): void {
    this.elements[id] = elem
  }
}

export const app = App.singleton
