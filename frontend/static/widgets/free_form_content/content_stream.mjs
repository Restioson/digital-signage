import { Widget } from '../widget.mjs'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'
import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { CachingContainer } from '../dynamic/caching_container.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A container which displays a live view of all the {@link FreeFormContent} on the server.
 *
 * @augments Widget
 */
export class ContentStream extends Widget {
  constructor () {
    super()

    /**
     * The caching container to store the content. This is kept in order to prevent constantly rebuilding child post
     * widgets.
     *
     * @type {CachingContainer}
     * @private
     */
    this.cache = new CachingContainer({ getId: post => post.id })
  }

  /**
   * Fetch the latest content and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const update = await fetch('/api/content').then(res => res.json())
    this.cache.children = update.content.map(content =>
      deserializeFreeFormContent(content)
    )
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['content-stream'],
          child: this.cache
        })
    })
  }
}
