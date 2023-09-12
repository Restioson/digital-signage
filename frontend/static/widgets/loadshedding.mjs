import { WithRefresh } from './dynamic/with_refresh.mjs'
import { importFromNpm } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
const { default: moment } = await importFromNpm('moment')

/**
 * A widget which displays the current loadshedding schedule.
 */
export class Loadshedding extends DeserializableWidget {
  /**
   * @param {json} scheduleOutput the loadshedding schedule in json form
   */
  constructor (scheduleOutput) {
    super()
    this.scheduleOutput = scheduleOutput
  }

  async refresh () {
    try {
      const response = await fetch('/api/loadshedding_schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch load shedding schedule')
      }
      const data = await response.json()
      const jsonData = JSON.parse(data[0])

      // gets the days date
      const today = moment().format('YYYY-MM-DD')
      const events = jsonData.events || []

      // find the 'events' for the days date
      const todayEvents = events.filter(event => event.start.startsWith(today))

      if (todayEvents.length === 0) {
        this.scheduleOutput = 'No more loadshedding scheduled for today.'
      } else {
        // gets the stage number
        const stage = todayEvents[0].note.match(/\d+/)[0]
        todayEvents.sort((a, b) => a.start.localeCompare(b.start))
        const schedule = [`Stage ${stage}`, 'Loadshedding today:']
        // gets the times for the day
        todayEvents.forEach(event => {
          const startTime = moment(event.start).format('HH:mm')
          const endTime = moment(event.end).format('HH:mm')
          schedule.push(`${startTime} - ${endTime}`)
        })

        // Find the closest load shedding time slot
        let mintimetill = moment()
          .endOf('day')
          .fromNow()
        todayEvents.forEach(event => {
          const startTime = moment(event.start)
          const timetill = moment(startTime).fromNow()
          if (mintimetill > timetill) {
            mintimetill = timetill
          }
        })
        if (mintimetill > moment().fromNow()) {
          this.scheduleOutput = `Loadshedding started ${mintimetill}\n${schedule.join(
            '\n'
          )}`
        } else {
          this.scheduleOutput = `Loadshedding starts ${mintimetill}\n${schedule.join(
            '\n'
          )}`
        }
      }
      this.scheduleOutput = 'Loadshedding Schedule:\n' + this.scheduleOutput
      return true
    } catch (error) {
      console.error('Error fetching load shedding schedule:', error)
    }
  }

  build () {
    return new WithRefresh({
      refresh: () => this.refresh(),
      period: 1000,
      builder: () => {
        const text = document.createElement('div')
        text.innerText = this.scheduleOutput
        return text
      }
    })
  }

  static fromXML (tag) {
    return new Loadshedding(tag.schedule_json)
  }

  className () {
    return 'loadshedding'
  }
}
