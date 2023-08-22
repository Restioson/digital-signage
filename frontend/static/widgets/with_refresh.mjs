import { Widget } from './widget.mjs'
import { Root } from './root.mjs'

export class WithRefresh extends Widget {
  constructor ({ refresh, period, builder }) {
    super()
    this.refresh = refresh
    this.builder = builder
    this.period = period
  }

  async refreshForever (element) {
    if (!element.isConnected) {
      return // Widget no longer exists in DOM; stop refreshing
    }

    await this.refresh()
    const newElement = this.renderChild()
    element.replaceWith(newElement)

    setTimeout(async () => this.refreshForever(newElement), this.period)
  }

  async refreshOnce (element) {
    await this.refresh()
    const newElem = this.renderChild()
    element.replaceWith(newElem)
    return newElem
  }

  renderChild () {
    const built = this.builder()
    return built instanceof Widget ? built.render() : built
  }

  build () {
    const element = this.renderChild()
    Root.getInstance().addPostRenderCallback(() => this.refreshForever(element))
    return element
  }
}
