import { Widget } from './widget.mjs'

export class Caption extends Widget {
  constructor ({ title, body }) {
    super()
    this.title = title
    this.body = body
  }

  static fromJSON (obj) {
    return new Caption(obj)
  }

  static maybeFromJSON (obj) {
    return obj ? Caption.fromJSON(obj) : null
  }

  render () {
    const container = document.createElement('div')
    container.className = 'content-caption'

    if (this.title) {
      const title = document.createElement('p')
      title.className = 'caption-title'
      title.innerText = this.title
      container.append(title)
    }

    const body = document.createElement('p')
    body.className = 'caption-body'
    body.innerText = this.body

    container.append(body)
    return container
  }
}
