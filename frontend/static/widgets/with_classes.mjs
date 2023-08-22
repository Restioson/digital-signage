import { Widget } from './widget.mjs'

export class WithClasses extends Widget {
  constructor ({ child, classList = null }) {
    super()
    this.child = child
    this.classList = classList
  }

  build () {
    const rendered =
      this.child instanceof Widget ? this.child.render() : this.child
    if (this.classList) {
      rendered.classList.add(...this.classList)
    }

    return rendered
  }
}
