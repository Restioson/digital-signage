import { Person } from './person.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Root } from '../root.mjs'
import { Container } from '../containers/container.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A {@link Widget} which displays a live view of all the {@link Person}s on the server.
 */
export class Department extends DeserializableWidget {
  constructor () {
    super()
    this.children = []
  }

  /**
   * Fetch the latest people and update the state.
   *
   * @private
   * @returns {Promise<void>}
   */
  async refresh () {
    const endpoint = `/api/departments/${Root.getInstance().getDepartment()}/people`
    const update = await fetch(endpoint).then(res => res.json())

    let dirty = update.people.length !== this.children.length

    if (!dirty) {
      for (let i = 0; i < update.people.length; i++) {
        dirty |= update.people[i].id === this.people.id

        if (dirty) {
          break
        }
      }
    }

    if (dirty) {
      this.children = update.people.map(Person.fromJSON)
    }

    return dirty
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () => new Container({ children: this.children })
    })
  }

  static fromXML (tag) {
    return new Department()
  }

  className () {
    return 'department'
  }
}
