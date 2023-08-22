import { Widget } from './widget.mjs'
import { WithClasses } from './with_classes.mjs'
import { Container } from './container.js'
import { Visibility } from './visibility.js'

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

  build () {
    let title = null
    if (this.title) {
      title = document.createElement('p')
      title.className = 'caption-title'
      title.innerText = this.title
    }

    const body = document.createElement('p')
    body.className = 'caption-body'
    body.innerText = this.body

    return new WithClasses({
      classList: ['content-caption'],
      child: new Container({
        children: [
          new Visibility({
            visible: Boolean(title),
            child: title
          }),
          body
        ]
      })
    })
  }
}
