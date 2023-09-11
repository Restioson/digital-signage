import { FreeFormContent } from './free_form_content.mjs'
import { Container } from '../containers/container.mjs'

/**
 * A piece of {@link FreeFormContent} which displays text having a title and body.
 *
 * @augments FreeFormContent
 */
export class TextWidget extends FreeFormContent {
  /**
   * @param {int} id the ID of the content
   * @param {string} title the content's title
   * @param {string} body the content's body
   */
  constructor ({ id, title, body }) {
    super({ id })
    this.title = title
    this.body = body
  }

  /**
   * Deserialize the TextWidget from its JSON API representation.
   *
   * @param obj
   * @returns {TextWidget}
   */
  static fromJSON (obj) {
    return new TextWidget(obj)
  }

  build () {
    const title = document.createElement('h3')
    const body = document.createElement('p')
    title.innerHTML = this.title
    body.innerHTML = this.body

    return new Container({ children: [title, body] })
  }
}
