import { Widget } from '../widget.mjs'
import { Container } from './container.mjs'
import { Visibility } from '../visibility.mjs'

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
