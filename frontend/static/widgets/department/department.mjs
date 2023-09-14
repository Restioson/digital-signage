import { Person } from './person.mjs'
import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Root } from '../root.mjs'
import { Container } from '../containers/container.mjs'
import { PaginatedContainer } from '../containers/paginated_container.mjs'

const REFRESH_INTERVAL_MS = 1000

/**
 * A {@link Widget} which displays a live view of all the {@link Person}s on the server.
 */
export class Department extends DeserializableWidget {
  constructor ({ pageSize, rotateEveryNSec }) {
    super()
    this.children = []
    this.pageSize = parseInt(pageSize)
    this.page = 0
    this.rotationPeriod = (rotateEveryNSec || 10) * 1000
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
        dirty = dirty || (update.people[i].id !== this.children[i].id)

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

  static fromXML (tag) {
    return new Department({
      pageSize: tag.attribute('page-size'),
      rotateEveryNSec: tag.attribute('secs-per-page')
    })
  }

  className () {
    return 'department'
  }
}
