import { Widget } from './widget.mjs'
import { Container } from './container.js'
import { Visibility } from './visibility.js'

export class ContentAndCaption extends Widget {
  constructor ({ content, caption }) {
    super()
    this.content = content
    this.caption = caption
  }

  build () {
    return new Container({
      children: [
        this.content,
        new Visibility({
          visible: Boolean(this.caption),
          child: this.caption
        })
      ]
    })
  }
}
