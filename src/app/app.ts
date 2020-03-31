import { Connection, getData, Group } from './data'
import { relativeRect, Size } from './size'
import { EventEmitter } from '../eventEmitter'

export class App {
  static singleton = new App()

  readonly isEditing = location.search === '?edit'

  readonly dataChange = new EventEmitter<void>()
  readonly canvasSizeChange = new EventEmitter<{ width: number; height: number }>()
  readonly editingChildChange = new EventEmitter<void>()

  private readonly data = getData()
  private elements: { [id: string]: HTMLElement } = {}
  private sizes: { [id: string]: Size } = {}

  private pEditingChild: HTMLElement | null = null

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

  removeGroup(groupId: string): void {
    const group = this.data.groups[groupId]
    delete this.data.groups[groupId]

    const removedIds = group.children?.map(c => c.id) ?? []
    removedIds.push(groupId)

    this.removeIds(removedIds)
    this.dataChange.emit()
  }

  deleteConnection(id: string, emit = true): void {
    delete this.data.connections[id]
    if (emit) this.dataChange.emit()
  }

  getData(): string {
    return JSON.stringify(this.data, null, 2)
  }

  setElem(id: string, elem: HTMLElement): void {
    this.elements[id] = elem
  }

  removeIds(ids: string[]): void {
    for (const id of ids) {
      delete this.sizes[id]
      delete this.elements[id]
    }

    const sizes = this.sizes
    this.eachConnection((connId, conn) => {
      if (sizes[conn.from] == null || sizes[conn.to] == null) {
        this.deleteConnection(connId, false)
      }
    })
  }

  set editingChild(node: HTMLElement | null) {
    if (node !== this.pEditingChild) {
      if (this.pEditingChild != null && this.pEditingChild.parentElement != null) {
        this.pEditingChild.parentElement.style.zIndex = ''
      }
      if (node != null && node.parentElement != null) {
        node.parentElement.style.zIndex = '2'
      }
      this.pEditingChild = node

      this.editingChildChange.emit()
    }
  }
}

export const app = App.singleton
