import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { deserializeWidget } from '../deserializable/widget_deserialization_factory.mjs'
import { Container } from '../containers/container.mjs'

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
      this.children = update.content.map(content => deserializeWidget(content))
    }

    return dirty
  }

  static fromJson (obj) {
    return new ContentStream(obj)
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['content-stream'],
          child: new Container({ children: this.children })
        })
    })
  }
}
