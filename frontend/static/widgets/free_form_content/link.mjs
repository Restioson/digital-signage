import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../content_and_caption.mjs'
import { Caption } from '../caption.js'
import { HtmlRenderable } from '../html_widget.mjs'

export class Link extends FreeFormContent {
  constructor ({ id, url, caption }) {
    super({ id })
    this.url = url
    this.caption = caption
  }

  static fromJSON (obj) {
    return new Link({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const link = document.createElement('a')
    link.innerText = this.url
    link.href = this.url

    return new ContentAndCaption({
      content: new HtmlRenderable(link),
      caption: this.caption
    })
  }
}
