
export class EventEmitter<T extends {} | void> {
  private readonly listeners: ((event: T) => void)[] = []

  public on(listener: (event: T) => void): void {
    this.listeners.push(listener)
  }

  public off(listener: (event: T) => void): boolean {
    const ix = this.listeners.indexOf(listener)
    if (ix !== -1) {
      this.listeners.splice(ix, 1)
      return true
    }
    return false
  }

  public once(listener: (event: T) => void): void {
    const l2 = (event: T): void => {
      this.off(l2)
      listener(event)
    }
    this.on(l2)
  }

  public emit(event: T): void {
    for (const listener of this.listeners) {
      listener(event)
    }
  }
}
