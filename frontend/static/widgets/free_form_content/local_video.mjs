import { FreeFormContent } from './free_form_content.mjs'
import { Caption } from '../caption.mjs'
import { ContentAndCaption } from '../containers/content_and_caption.mjs'

/**
 * A piece of {@link FreeFormContent} which displays a video stored on the CampuSign server.
 *
 * @augments FreeFormContent
 */
export class LocalVideo extends FreeFormContent {
  /**
   * @param {int} id the content's ID
   * @param {?Caption} caption the video's caption
   */
  constructor ({ id, caption }) {
    super({ id })
    this.caption = caption
  }

  /**
   * Deserialize the LocalVideo from its JSON API representation.
   *
   * @param obj
   * @returns {LocalVideo}
   */
  static fromJSON (obj) {
    return new LocalVideo({
      id: obj.id,
      caption: Caption.maybeFromJSON(obj.caption)
    })
  }

  build () {
    const video = document.createElement('video')
    video.src = `/api/content/${this.id}/blob`
    return new ContentAndCaption({
      content: video,
      caption: this.caption
    })
  }

  className () {
    return 'free-form-content video'
  }
}
