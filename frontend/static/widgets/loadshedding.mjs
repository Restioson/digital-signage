import { WithRefresh } from './dynamic/with_refresh.mjs'
import { WithClasses } from './with_classes.mjs'
import { importFromNpm } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
const { default: moment } = await importFromNpm('moment')

/**
 * A widget which displays the current loadshedding schedule.
 */
export class Loadshedding extends DeserializableWidget {
  /**
   * @param {json} scheduleJson the loadshedding schedule in json form
   */
  constructor (scheduleJson) {
    super()
    this.scheduleJson = scheduleJson
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
      const today = new Date().toISOString().split('T')[0]
      const now = new Date()
      const events = jsonData.events || []

      // find the 'events' for the days date
      const todayEvents = events.filter(event => event.start.startsWith(today))

      if (todayEvents.length === 0) {
        this.scheduleJson = 'No more loadshedding scheduled for today.'
      } else {
        // gets the stage number
        const stage = todayEvents[0].note.match(/\d+/)[0]
        todayEvents.sort((a, b) => a.start.localeCompare(b.start))
        const schedule = [`Stage ${stage}`, 'Loadshedding today:']
        // gets the times for the day
        todayEvents.forEach(event => {
          const startTime = new Date(event.start)
          const endTime = new Date(event.end)
          const startFormatted = `${startTime
            .getHours()
            .toString()
            .padStart(2, '0')}:${startTime
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
          const endFormatted = `${endTime
            .getHours()
            .toString()
            .padStart(2, '0')}:${endTime
            .getMinutes()
            .toString()
            .padStart(2, '0')}`
          schedule.push(`${startFormatted} - ${endFormatted}`)
        })

        // Find the closest load shedding time slot
        const closestEvent = todayEvents.reduce((closest, event) => {
          const eventStartTime = new Date(event.start)
          if (
            eventStartTime > now &&
            (!closest || eventStartTime < closest.start)
          ) {
            return { start: eventStartTime }
          }
          return closest
        }, null)
        // 
        if (closestEvent) {
          const closestTimeFormatted = closestEvent.start.toISOString()
          // Calculate time until the closest event using moment
          const date = closestTimeFormatted
          console.log(closestTimeFormatted)
          const dur = moment.duration(moment(date).diff(moment()))
          const timetill = dur.hours()+' hours and '+dur.minutes()+" minutes" 
          this.scheduleJson = `Time until closest event: ${timetill}\n${schedule.join(
            '\n'
          )}`
        } else {
          this.scheduleJson = `${schedule.join('\n')}\n`
        }
      }
      this.scheduleJson = 'Loadshedding Schedule:\n' + this.scheduleJson
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
        text.innerText = this.scheduleJson
        return new WithClasses({ classList: ['loadshedding'], child: text })
      }
    })
  }

  static fromJSON (obj) {
    return new Loadshedding(obj.schedule_json)
  }
}
