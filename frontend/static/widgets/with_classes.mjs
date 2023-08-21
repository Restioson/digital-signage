import { Widget } from '../widget.mjs'

export class WithClasses extends Widget {
  constructor ({ child, classList = null }) {
    super()
    this.child = child
    this.classList = classList
  }

  async refresh () {
    await this.child.refresh()
  }

  render () {
    const rendered = this.child.render()
    if (this.classList) {
      rendered.classList.add(this.classList)
    }

    return rendered
  }
}
