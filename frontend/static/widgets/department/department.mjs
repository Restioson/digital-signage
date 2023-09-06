import { Lecturer } from './lecturer.mjs'
import { WithClasses } from '../with_classes.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Root } from '../root.mjs'
import { Container } from '../containers/container.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A {@link Widget} which displays a live view of all the {@link Lecturer}s on the server.
 */
export class Department extends DeserializableWidget {
  constructor () {
    super()
    this.children = []
  }

  /**
   * Fetch the latest lecturers and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const endpoint = `/api/departments/${Root.getInstance().getDepartment()}/lecturers`
    const update = await fetch(endpoint).then(res => res.json())

    let dirty = update.lecturers.length !== this.children.length

    if (!dirty) {
      for (let i = 0; i < update.lecturers.length; i++) {
        dirty |= update.lecturers[i].id === this.lecturers.id

        if (dirty) {
          break
        }
      }
    }

    if (dirty) {
      this.children = update.lecturers.map(Lecturer.fromJSON)
    }

    return dirty
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () =>
        new WithClasses({
          classList: ['department'],
          child: new Container({ children: this.children })
        })
    })
  }

  static fromJSON (obj) {
    return new Department()
  }
}
