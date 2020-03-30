import { Group, GroupChild, Status } from './data'
import { button, byId, div, icon, icons, makeNode, textInput } from './util'
import { addChild, repaint, resize } from './main'
import { app } from './app'

export const isEditing = location.search === '?edit'

const saveButton = byId('save', HTMLButtonElement)
saveButton.addEventListener('click', clickSave)

if (module.hot) module.hot.addDisposeHandler(() => {
  saveButton.removeEventListener('click', clickSave)
  document.body.classList.remove('edit')
})

if (isEditing) {
  document.body.classList.add('edit')
}

export function clickSave(): void {
  console.log(app.getData())
  alert('Copy the string that was printed to the console and insert it into the `data/data.json` file!')
}

export function editableGroup(id: string, group: Group, title: HTMLElement): void {
  if (isEditing) {
    title.contentEditable = 'true'
    title.addEventListener('input', () => group.title = title.innerText.trim())

    const overlay = makeNode('div', 'overlay', '', { contenteditable: 'false' })

    const moveButton = makeNode('button', 'move-btn', '✖')
    const deleteButton = makeNode('button', 'delete-btn', '😡')
    const addButton = makeNode('button', 'add-btn', '+')

    moveButton.title = 'click and drag to move this group'
    deleteButton.title = 'delete this group'
    addButton.title = 'add task'

    moveButton.addEventListener('mousedown', (e) => {
      if (title.parentElement != null) {
        dragged = title.parentElement
        draggedNode = group
        const rect = dragged.getBoundingClientRect()
        dragOffsetX = e.clientX - rect.left
        dragOffsetY = e.clientY - rect.top
      }
    })

    deleteButton.addEventListener('click', () => {
      if (confirm('Do you want to delete this group?')) {
        title.parentElement?.remove()
        app.deleteGroup(id)
      }
    })

    addButton.addEventListener('click', () => {
      const id = addChild(group, title.parentElement!!)
      const element = app.getElem(id)
      editableChild(group.children!![id], element)
      repaint()
      editChildStatus(group.children!![id], element)
      setTimeout(() => {
        (element.lastElementChild as HTMLElement).focus()
      })
    })

    overlay.append(moveButton, deleteButton, addButton)
    title.prepend(overlay)
  }
}

export function editableChild(child: GroupChild, label: HTMLElement): void {
  if (isEditing) {
    label.contentEditable = 'true'
    label.addEventListener('input', () => child.label = label.innerText.trim())
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


let editingChild: HTMLElement | null = null

export function editChildStatus(child: GroupChild, elem: HTMLElement): void {
  if (isEditing) {
    if (editingChild != null) {
      if (editingChild.parentElement != null) {
        editingChild.parentElement.style.zIndex = ''
      }
      editingChild.nextElementSibling?.remove()

      if (editingChild === elem) {
        editingChild = null
        return
      }
    }
    editingChild = elem

    const after = div('edit-status', 'Status: ')
    after.append(
      button(icons.blocked, 'blocked', () => setStatus(elem, child, 'blocked')),
      button(icons.unassigned, 'unassigned', () => setStatus(elem, child, 'unassigned')),
      button(icons.assigned, 'assigned', () => setStatus(elem, child, 'assigned')),
      button(icons.complete, 'complete', () => setStatus(elem, child, 'complete')),
      makeNode('br'),
      'Link: ',
      textInput(child.href?.replace(/^https:\/\/github.com\//, './') ?? '', (s) => {
        const v = s.trim().replace(/^\.\//, 'https://github.com/')
        if (v === '' && 'href' in child) {
          delete child.href
          const childInner = div('child-inner', child.label)
          elem.lastElementChild?.replaceWith(childInner)

          editableChild(child, childInner)
        } else if (v !== '' && child.href == null) {
          child.href = v
          const childInner = makeNode('a', 'child-inner', child.label, { href: v })
          elem.lastElementChild?.replaceWith(childInner)

          editableChild(child, childInner)
        } else {
          child.href = v
          elem.lastElementChild?.setAttribute('href', v)
        }
      }),
    )

    elem.insertAdjacentElement('afterend', after)
    if (elem.parentElement != null) {
      elem.parentElement.style.zIndex = '2'
    }
  }
}

function setStatus(elem: HTMLElement, child: GroupChild, status: Status): void {
  elem.className = `child ${status}`
  if (elem.firstElementChild != null) {
    elem.firstElementChild.innerHTML = icon(status)
  }
  child.status = status
}
