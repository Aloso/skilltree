import { Group, GroupChild, Status } from './data'
import { button, byId, div, icon, icons, makeNode, textInput } from './util'
import { data, deleteNode, repaint, resize } from './main'

let isEditing = false

const editButton = byId('edit', HTMLButtonElement)
editButton.addEventListener('click', clickEdit)

if (module.hot) module.hot.addDisposeHandler(() => {
  editButton.removeEventListener('click', clickEdit)
  editButton.innerText = 'edit'
  document.body.classList.remove('edit')
})

export function clickEdit(): void {
  if (!isEditing) {
    if (confirm('After editing the skill tree, you need to download the generated JSON file ' +
      'and rebuild the website with it.\n\nDo you want to proceed?')) {
      makeEditable()
    }
  } else {
    console.log(JSON.stringify(data, null, 2))
    alert('Copy the string that was printed to the console and insert it into the `data/data.json` file!')
  }
}

function makeEditable(): void {
  if (!isEditing) {
    isEditing = true
    editButton.innerText = 'save'
    document.body.classList.add('edit')
    makeNodesEditable()
  }
}

const editables: { elem: HTMLElement; oninput(): void }[] = []
const groups: { id: string; group: Group; title: HTMLElement }[] = []

export function editableGroup(id: string, group: Group, title: HTMLElement): void {
  editables.push({
    elem: title,
    oninput(): void {
      group.title = title.innerText.trim()
    },
  })
  groups.push({ id, group, title })
}

export function editableChild(child: GroupChild, label: HTMLElement): void {
  editables.push({
    elem: label,
    oninput(): void {
      child.label = label.innerText.trim()
    },
  })
}

function makeNodesEditable(): void {
  editables.forEach((e) => {
    e.elem.contentEditable = 'true'
    e.elem.addEventListener('input', () => e.oninput())
  })
  editables.length = 0

  groups.forEach((n) => {
    const overlay = makeNode('div', 'overlay', '', { contenteditable: 'false' })

    const moveButton = makeNode('button', 'move-btn', '✖')
    const deleteButton = makeNode('button', 'delete-btn', '😡')
    const addButton = makeNode('button', 'add-btn', '+')

    moveButton.title = 'click and drag to move this group'
    deleteButton.title = 'delete this group'
    addButton.title = 'add task'

    moveButton.addEventListener('mousedown', (e) => {
      if (n.title.parentElement != null) {
        dragged = n.title.parentElement
        draggedNode = n.group
        const rect = dragged.getBoundingClientRect()
        dragOffsetX = e.clientX - rect.left
        dragOffsetY = e.clientY - rect.top
      }
    })

    deleteButton.addEventListener('click', () => {
      if (confirm('Do you want to delete this group?')) {
        n.title.parentElement?.remove()
        deleteNode(n.id, n.group)
      }
    })

    overlay.append(moveButton, deleteButton, addButton)
    n.title.prepend(overlay)
  })
  groups.length = 0
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
          makeNodesEditable()
        } else if (v !== '' && child.href == null) {
          child.href = v
          const childInner = makeNode('a', 'child-inner', child.label, { href: v })
          elem.lastElementChild?.replaceWith(childInner)

          editableChild(child, childInner)
          makeNodesEditable()
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
