import { GroupChild, Status } from './data'
import { button, div, emoji, emojis, iconNode, makeNode, textInput } from '../util'
import { app } from './app'

/**
 * A HTML view for a group child
 */
export class ChildElem {
  private readonly icon: HTMLElement
  private labelElem: HTMLElement
  private readonly elem: HTMLElement

  private editDiv: HTMLElement | null = null
  private linkIcon: HTMLElement | null = null
  private isEditing = false

  constructor(private readonly child: GroupChild) {
    this.icon = makeNode('div', 'child-icon', emoji(child.status), { title: child.status })
    this.icon.setAttribute('tabindex', '0')

    if (child.href == null) {
      this.labelElem = div('child-inner', child.label)
    } else {
      this.labelElem = makeNode('a', 'child-inner', child.label, { href: child.href })
    }

    this.elem = makeNode('div', `child ${child.status}`)
    this.elem.append(this.icon, this.labelElem)

    if (app.isEditing) {
      this.icon.addEventListener('click', () => this.clickEdit())
      this.labelElem.contentEditable = 'true'
      this.labelElem.addEventListener('input', () => {
        this.label = this.labelElem.textContent?.trim() ?? ''
      })
    }
  }

  getNode(): HTMLElement {
    return this.elem
  }

  setStatus(newStatus: Status): void {
    if (newStatus !== this.child.status) {
      this.child.status = newStatus
      this.elem.className = `child ${newStatus}`
      this.icon.innerText = emoji(newStatus)
      this.icon.title = newStatus
    }
  }

  get href(): string {
    return this.child.href ?? ''
  }

  set href(href: string) {
    href = href.trim().replace(/^\.\//, 'https://github.com/')
    if (href !== this.href) {
      const isBlank = !this.labelElem.hasAttribute('href')
      if ((href === '') !== isBlank) {
        const oldContent = this.labelElem

        if (href === '') {
          delete this.child.href
          this.labelElem = div('child-inner', this.child.label)
        } else {
          this.child.href = href
          this.labelElem = makeNode('a', 'child-inner', this.child.label, { href })
        }
        oldContent.replaceWith(this.labelElem)
      } else {
        this.child.href = href
        this.labelElem.setAttribute('href', href)
      }

      if (this.linkIcon != null) {
        if (href === '') this.linkIcon.removeAttribute('href')
        else this.linkIcon.setAttribute('href', href)
      }
    }
  }

  get simplifiedHref(): string {
    return this.child.href?.replace(/^https:\/\/github\.com\//, './') ?? ''
  }

  set label(label: string) {
    this.child.label = label
  }

  focusLabel(): void {
    this.labelElem.focus()
  }

  get id(): string {
    return this.child.id
  }

  clickEdit(): void {
    if (this.isEditing) {
      this.hideEditor()
      app.editingChild = null
    } else {
      this.showEditor()
      app.editingChild = this.elem
      app.editingChildChange.once(() => this.hideEditor())
    }
  }

  private hideEditor(): void {
    this.isEditing = false
    this.editDiv?.remove()
  }

  private showEditor(): void {
    this.isEditing = true
    if (this.editDiv == null) this.editDiv = this.createEditDiv()
    this.elem.append(this.editDiv)
  }

  private createEditDiv(): HTMLElement {
    const elem = document.createElement('div')
    elem.className = 'edit-status'

    const attrs = this.href === ''
      // eslint-disable-next-line id-blacklist
      ? undefined
      : { href: this.href }
    this.linkIcon = iconNode('a', 'link', 'plain', attrs)

    elem.append(
      button(emojis.blocked, 'blocked', () => this.setStatus('blocked')),
      button(emojis.unassigned, 'unassigned', () => this.setStatus('unassigned')),
      button(emojis.assigned, 'assigned', () => this.setStatus('assigned')),
      button(emojis.complete, 'complete', () => this.setStatus('complete')),
      makeNode('br'),
      this.linkIcon,
      textInput(this.simplifiedHref, (s) => this.href = s),
    )
    this.editDiv = elem
    return elem
  }
}
