import { Lecturer } from './lecturer.mjs'
import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { CachingContainer } from '../dynamic/caching_container.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A {@link Widget} which displays a live view of all the {@link Lecturer}s on the server.
 */
export class Department extends DeserializableWidget {
  constructor () {
    super()

    /**
     * The caching container to store the content. This is kept in order to prevent constantly rebuilding child lecturers
     * widgets.
     *
     * @type {CachingContainer}
     * @private
     */
    this.cache = new CachingContainer({ getId: lecturer => lecturer.id })
  }

  /**
   * Fetch the latest lecturers and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const update = await fetch('/api/lecturers').then(res => res.json())
    this.cache.children = update.lecturers.map(Lecturer.fromJSON)
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['department'],
          child: this.cache
        })
    })
  }

  static fromJSON (obj) {
    return new Department()
  }
}
