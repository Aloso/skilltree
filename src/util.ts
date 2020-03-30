import { Status } from './data'

export function byId<T extends HTMLElement>(id: string, type: new() => T): T {
  const el = document.getElementById(id)
  if (el == null) throw new Error(`Element '${id}' is null`)
  if (!(el instanceof type)) throw new Error(`Element '${id}' is not an instance of ${type.name}`)
  return el
}

export function makeNode(
  nodeName: string,
  className?: string,
  content?: string,
  attrs: { [key: string]: string } = {},
): HTMLElement {
  const el = document.createElement(nodeName)
  if (className != null) el.className = className
  if (content != null) el.innerText = content
  for (const k in attrs) if (attrs.hasOwnProperty(k)) {
    el.setAttribute(k, attrs[k])
  }
  return el
}

export function div(className: string, content: string): HTMLDivElement {
  const el = document.createElement('div')
  el.className = className
  el.innerText = content
  return el
}

export function uuid(prefix = ''): string {
  const d = +new Date()
  const r = Math.floor(Math.random() * 16777216)
  return `${prefix}${d.toString(16)}-${r.toString(16)}`
}

export const icons = {
  blocked: '⌚',
  unassigned: '🙋',
  assigned: '🛠️',
  complete: '☑️',
}

export function icon(status: Status): string {
  return icons[status]
}

export function button(content: string, clazz: string, onClick: () => void, title: string | null = clazz): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.innerHTML = content
  btn.className = clazz
  if (title != null) btn.title = title
  btn.addEventListener('click', onClick)
  return btn
}

export function textInput(content: string, onInput: (s: string) => void): HTMLInputElement {
  const input = document.createElement('input')
  input.value = content
  input.addEventListener('input', () => onInput(input.value))
  return input
}
