import { Widget } from '../widget.mjs'

export class ContentAndCaption extends Widget {
  constructor ({ content, caption }) {
    super()
    this.content = content
    this.caption = caption
  }

  render () {
    const container = document.createElement('div')
    container.append(this.content.render())

    if (this.caption) {
      container.append(this.caption.render())
    }

    return container
  }
}
