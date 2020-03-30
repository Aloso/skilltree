import { Side } from './data'

export interface Point {
  x: number
  y: number
}

export class Size {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly width: number,
    readonly height: number,
    readonly outerHeight = height,
  ) {}

  static from(rect: ClientRect, outerHeight = rect.height): Size {
    return new Size(rect.left, rect.top, rect.width, rect.height, outerHeight)
  }

  sideCenter(side: Side): Point {
    switch (side) {
      case 'west': return {
        x: this.x,
        y: this.y + this.height / 2,
      }
      case 'east': return {
        x: this.x + this.width,
        y: this.y + this.height / 2,
      }
      case 'north': return {
        x: this.x + this.width / 2,
        y: this.y,
      }
      case 'south': return {
        x: this.x + this.width / 2,
        y: this.y + this.outerHeight,
      }
    }
  }

  shift(sx: number, sy: number): Size {
    return new Size(this.x + sx, this.y + sy,
      this.width, this.height, this.outerHeight)
  }
}

export function relativeRect(elem: HTMLElement): Size {
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
