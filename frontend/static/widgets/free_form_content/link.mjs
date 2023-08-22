import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'

/**
 * A piece of {@link FreeFormContent} which displays a link.
 *
 * @augments FreeFormContent
 */
export class Link extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} url the URL to display
   * @param {?Caption} caption the link's caption
   */
  constructor ({ id, url, caption }) {
    super({ id })
    this.url = url
    this.caption = caption
  }

  /**
   * Deserialize the Link from its JSON API representation.
   *
   * @param obj
   * @returns {Link}
   */
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
      content: link,
      caption: this.caption
    })
  }
}
