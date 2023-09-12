import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Container } from '../containers/container.mjs'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'
import { PaginatedContainer } from '../containers/paginated_container.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A container which displays a live view of all the {@link FreeFormContent} on the server.
 *
 * @augments DeserializableWidget
 */
export class ContentStream extends DeserializableWidget {
  /**
   * @param {number[]} streams which content streams this widget subscribes to
   * @param {?number} the amount of posts to fetch
   */
  constructor ({ fetchAmount, streams, pageSize, rotateEveryNSec }) {
    super()
    this.children = []
    this.fetchAmount = fetchAmount
    this.streams = streams
    this.pageSize = parseInt(pageSize)
    this.page = 0
    this.rotationPeriod = (rotateEveryNSec || 10) * 1000
  }

  /**
   * Fetch the latest content and update the state.
   *
   * @private
   * @returns {Promise<boolean>}
   */
  async refresh () {
    const params = this.streams.map(stream => `stream=${stream}`)
    const amt = this.fetchAmount ? `last=${this.fetchAmount}&` : ''
    const update = await fetch(`/api/content?${amt}${params.join('&')}`).then(
      res => res.json()
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
      fetchAmount: tag.attribute('fetch-amount'),
      streams: tag.children().map(stream => parseInt(stream.attribute('id'))),
      pageSize: tag.attribute('page-size'),
      rotateEveryNSec: tag.attribute('secs-per-page')
    })
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () => {
        if (this.pageSize) {
          return new WithRefresh({
            refresh: () => {
              this.page += 1
              return true
            },
            period: this.rotationPeriod,
            builder: () => {
              return new PaginatedContainer({
                children: this.children,
                pageSize: this.pageSize,
                page: this.page
              })
            }
          })
        } else {
          return new Container({ children: this.children })
        }
      }
    })
  }

  className () {
    return 'content-stream'
  }
}
