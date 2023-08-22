import { Widget } from '../widget.mjs'
import { Container } from '../containers/container.mjs'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'
import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../with_refresh.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A container which displays a live view of all the {@link FreeFormContent} on the server.
 *
 * @augments Widget
 */
export class ContentStream extends Widget {
  constructor () {
    super()
    this.content = []
  }

  /**
   * Fetch the latest content and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const contentUpdate = await fetch('/api/content').then(res => res.json())
    this.content = contentUpdate.content
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['content-stream'],
          child: new Container({
            children: this.content.map(content =>
              deserializeFreeFormContent(content)
            )
          })
        })
    })
  }
}
