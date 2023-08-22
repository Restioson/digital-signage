import { FreeFormContent } from './free_form_content.mjs'
import { Caption } from '../caption.js'
import { ContentAndCaption } from '../content_and_caption.mjs'
import { HtmlRenderable } from '../html_widget.mjs'

export class LocalImage extends FreeFormContent {
  constructor ({ id, caption }) {
    super({ id })
    this.caption = caption
  }

  static fromJSON (obj) {
    return new LocalImage({
      id: obj.id,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const img = document.createElement('img')
    img.src = `/api/content/${this.id}/blob`
    return new ContentAndCaption({
      content: new HtmlRenderable(img),
      caption: this.caption
    })
  }
}
