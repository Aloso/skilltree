import { library, icon, config, IconName } from '@fortawesome/fontawesome-svg-core'
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons/faArrowsAlt'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt'
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink'
config.autoReplaceSvg = false
library.add(faArrowsAlt, faPlus, faTrashAlt, faLink)

import { Status } from './app/data'

export function byId<T extends HTMLElement>(id: string, type: new() => T): T {
  const el = document.getElementById(id)
  if (el == null) throw new Error(`Element '${id}' is null`)
  if (!(el instanceof type)) throw new Error(`Element '${id}' is not an instance of ${type.name}`)
  return el
}

export function makeNode(
  nodeName: string,
  className?: string,
  content?: string | HTMLElement,
  attrs: { [key: string]: string } = {},
): HTMLElement {
  const el = document.createElement(nodeName)
  if (className != null) el.className = className
  if (content != null) {
    if (typeof content === 'string') el.innerText = content
    else el.append(content)
  }
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

export function iconNode(
  nodeName: string,
  iconName: IconName,
  className?: string,
  attrs: { [key: string]: string } = {},
): HTMLElement {
  const el = document.createElement(nodeName)
  if (className != null) el.className = className
  el.innerHTML = icon({ prefix: 'fas', iconName }).html[0]
  for (const k in attrs) if (attrs.hasOwnProperty(k)) {
    el.setAttribute(k, attrs[k])
  }
  return el
}

export function uuid(prefix = ''): string {
  const d = (+new Date() - 1585612800000).toString(16)
  const r = Math.floor(Math.random() * 4194304).toString(16)
  return `${prefix}${fill(d, 12)}-${fill(r, 6)}`
}

function fill(s: string, len: number): string {
  return '000000000000000000000000000000000000'
    .slice(0, Math.max(0, len - s.length)) + s
}

export const emojis = {
  blocked: '⌚',
  unassigned: '🙋',
  assigned: '🛠️',
  complete: '☑️',
}

export function emoji(status: Status): string {
  return emojis[status]
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
