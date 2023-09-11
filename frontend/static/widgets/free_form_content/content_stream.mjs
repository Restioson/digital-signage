import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Container } from '../containers/container.mjs'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A container which displays a live view of all the {@link FreeFormContent} on the server.
 *
 * @augments DeserializableWidget
 */
export class ContentStream extends DeserializableWidget {
  /**
   * @param {number[]} streams which content streams this widget subscribes to
   */
  constructor ({ streams }) {
    super()
    this.children = []
    this.streams = streams
  }

  /**
   * Fetch the latest content and update the state.
   *
   * @private
   * @returns {Promise<boolean>}
   */
  async refresh () {
    const params = this.streams.map(stream => `stream=${stream}`)
    const update = await fetch(`/api/content?${params.join('&')}`).then(res =>
      res.json()
    )

    let dirty = update.content.length !== this.children.length

    if (!dirty) {
      for (let i = 0; i < update.content.length; i++) {
        dirty |= update.content[i].id === this.children.id

        if (dirty) {
          break
        }
      }
    }

    if (dirty) {
      this.children = update.content.map(content =>
        deserializeFreeFormContent(content)
      )
    }

    return dirty
  }

  static fromXML (tag) {
    return new ContentStream({
      streams: tag.children().map(stream => parseInt(stream.attribute('id')))
    })
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () => new Container({ children: this.children })
    })
  }

  className () {
    return 'content-stream'
  }
}
