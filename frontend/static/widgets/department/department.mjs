import { Lecturer } from './lecturer.mjs'
import { Container } from '../containers/container.mjs'
import { Widget } from '../widget.mjs'
import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../with_refresh.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A {@link Widget} which displays a live view of all the {@link Lecturer}s on the server.
 */
export class Department extends Widget {
  constructor () {
    super()
    this.lecturers = []
  }

  /**
   * Fetch the latest lecturers and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const update = await fetch('/api/lecturers').then(res => res.json())
    this.lecturers = update.lecturers
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['department'],
          child: new Container({
            children: this.lecturers.map(Lecturer.fromJSON)
          })
        })
    })
  }
}
