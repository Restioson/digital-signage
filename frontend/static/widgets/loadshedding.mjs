import { WithRefresh } from './dynamic/with_refresh.mjs'
import { importFromNpm } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
import { Container } from './containers/container.mjs'
const { default: moment } = await importFromNpm('moment')

/**
 * A widget which displays the current loadshedding schedule.
 */
export class Loadshedding extends DeserializableWidget {
  constructor () {
    super()
    this.scheduleJsonData = null
  }

  async fetch_loadshedding () {
    try {
      const response = await fetch('/api/loadshedding_schedule')
      if (!response.ok) {
        throw new Error('Failed to fetch load shedding schedule')
      }
      const data = await response.json()
      this.scheduleJsonData = JSON.parse(data[0])
    } catch (error) {
      console.error('Error fetching load shedding schedule:', error)
    }
  }

  build () {
    return new WithRefresh({
      refresh: () => this.fetch_loadshedding(),
      period: 1000 * 60 * 5,
      builder: () => {
        return new WithRefresh({
          refresh: () => true,
          period: 1000,
          builder: () => {
            const header = document.createElement('h2')
            header.className = 'loadshedding-header'
            header.innerText = 'Loadshedding Schedule'

            const text = document.createElement('div')
            text.className = 'loadshedding-text'
            text.innerText = this.buildScheduleOutput()

            return new Container({ children: [header, text] })
          }
        })
      }
    })
  }

  buildScheduleOutput () {
    if (this.scheduleJsonData === null) {
      return 'Loading loadshedding schedule'
    }

    const today = moment().format('YYYY-MM-DD')

    try {
      const events = this.scheduleJsonData.events || []
      // find the 'events' for the days date
      const todayEvents = events.filter(event => event.start.startsWith(today))

      if (todayEvents.length === 0) {
        return 'No more loadshedding scheduled for today.'
      }

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
      let minTimeTill = moment().endOf('day')
      let minTimeTillEnd = moment().endOf('day')
      todayEvents.forEach(event => {
        const startTime = moment(event.start)
        const timeTillEnd = moment(startTime)
        const timetill = moment(startTime)
        if (minTimeTill.diff(timetill, 'seconds') > 0) {
          minTimeTill = timetill
          minTimeTillEnd = timeTillEnd
        }
      })

      if (
        minTimeTill.diff(moment(), 'seconds') < 0 &&
        minTimeTillEnd.diff(moment(), 'seconds') < 0
      ) {
        return `Loadshedding started ${minTimeTill.fromNow()}\n${schedule.join(
          '\n'
        )}`
      } else if (
        minTimeTill.diff(moment(), 'seconds') > 0 &&
        minTimeTillEnd.diff(moment(), 'seconds') < 0
      ) {
        return `Loadshedding starts ${minTimeTill.fromNow()}\n${schedule.join(
          '\n'
        )}`
      } else {
        return `Loadshedding ended ${minTimeTillEnd.fromNow()}\n${schedule.join(
          '\n'
        )}`
      }
    } catch (error) {
      console.error('Error fetching load shedding schedule:', error)
      return 'Loading loadshedding schedule'
    }
  }

  static fromXML (tag) {
    return new Loadshedding()
  }

  className () {
    return 'loadshedding'
  }
}
