import { FreeFormContent } from './free_form_content.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'
import { Caption } from '../caption.mjs'

/**
 * A piece of {@link FreeFormContent} which displays the embedded content of a link along with a potential caption.
 *
 * @augments FreeFormContent
 */
export class Iframe extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {URL} url the URL to embed in the iFrame
   * @param {?Caption} caption the iframe's caption
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
    return new Iframe({
      id: obj.id,
      url: obj.url,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const iframeContent = document.createElement('iframe')
    iframeContent.src = this.url
    return new ContentAndCaption({
      content: iframeContent,
      caption: this.caption
    })
  }

  className () {
    return 'iframe-content'
  }
}
