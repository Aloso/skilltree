import { Group, GroupChild } from './data'
import { div, iconNode, makeNode, uuid } from '../util'
import { ChildElem } from './childElem'
import { app } from './app'
import { repaint, resize } from '../main'

export class GroupElem {
  private readonly title: HTMLElement
  private readonly elem: HTMLElement
  private readonly children: ChildElem[] = []

  constructor(private readonly id: string, private readonly group: Group) {
    this.title = div('node-title', group.title)

    this.elem = document.createElement('div')
    this.elem.className = 'node'
    this.elem.style.left = group.x + 'px'
    this.elem.style.top = group.y + 'px'
    this.elem.style.width = group.width + 'px'
    this.elem.append(this.title)

    if (group.children != null) {
      for (const child of group.children) {
        const childElem = new ChildElem(child)
        this.children.push(childElem)
        this.elem.append(childElem.getNode())
      }
    }

    if (app.isEditing) {
      this.title.contentEditable = 'true'
      this.title.addEventListener('input', () => {
        this.group.title = this.title.textContent?.trim() ?? ''
      })

      const overlay = makeNode('div', 'overlay', '', { contenteditable: 'false' })

      const moveButton = iconNode('button', 'arrows-alt', 'move-btn')
      const deleteButton = iconNode('button', 'trash-alt', 'delete-btn')
      const addButton = iconNode('button', 'plus', 'add-btn')

      moveButton.title = 'click and drag to move this group'
      deleteButton.title = 'delete this group'
      addButton.title = 'add task'

      moveButton.style.color = '#333'
      deleteButton.style.color = '#c00'
      addButton.style.color = '#07a'

      moveButton.addEventListener('mousedown', (e) => {
        dragged = this.elem
        draggedNode = group
        const rect = dragged.getBoundingClientRect()
        dragOffsetX = e.clientX - rect.left
        dragOffsetY = e.clientY - rect.top
      })

      deleteButton.addEventListener('click', () => {
        if (confirm('Do you want to delete this group?')) this.remove()
      })

      addButton.addEventListener('click', () => {
        this.addChild({
          id: uuid('i'),
          label: '',
          status: 'unassigned',
        }, true)
      })

      overlay.append(moveButton, deleteButton, addButton)
      this.title.prepend(overlay)
    }
  }

  getNode(): HTMLElement {
    return this.elem
  }

  remove(): void {
    this.elem.remove()
    app.removeGroup(this.id)
  }

  addChild(child: GroupChild, editStatus = false): void {
    if (this.group.children == null) this.group.children = []
    this.group.children.push(child)
    const childElem = new ChildElem(child)
    this.children.push(childElem)
    this.elem.append(childElem.getNode())

    app.setElem(child.id, childElem.getNode())

    if (editStatus) {
      childElem.clickEdit()
      setTimeout(() => childElem.focusLabel())
    }
    repaint()
  }

  registerElements(): void {
    app.setElem(this.id, this.elem)

    if (this.group.children != null) {
      for (const child of this.children) {
        app.setElem(child.id, child.getNode())
      }
    }
  }
}

let dragged: HTMLElement | null = null
let draggedNode: Group | null = null
let dragOffsetX = 0
let dragOffsetY = 0

window.addEventListener('mousemove', (e) => {
  if (dragged != null) {
    const x = window.scrollX + e.clientX - dragOffsetX
    const y = window.scrollY + e.clientY - dragOffsetY
    dragged.style.left = x + 'px'
    dragged.style.top = y + 'px'
    if (draggedNode != null) {
      draggedNode.x = x
      draggedNode.y = y
      repaint()
    }
  }
})

function endDragging(): void {
  if (dragged != null) {
    dragged = null
    resize()
  }
}

window.addEventListener('mouseup', endDragging)
window.addEventListener('blur', endDragging)
