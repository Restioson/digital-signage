import { WithRefresh } from './dynamic/with_refresh.mjs'
import { importFromNpm } from '../util.mjs'
import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
const { default: moment } = await importFromNpm('moment')

/**
 * A widget which displays the current loadshedding schedule.
 */
export class Loadshedding extends DeserializableWidget {
  constructor () {
    super()
    this.scheduleJsonData = ''
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
            // gets the days date
            const today = moment().format('YYYY-MM-DD')
            try {
              const events = this.scheduleJsonData.events || []
              // find the 'events' for the days date
              const todayEvents = events.filter(event =>
                event.start.startsWith(today)
              )
              const scheduleOutput = scheduleOutput
              if (todayEvents.length === 0) {
                scheduleOutput =
                  'No more loadshedding scheduled for today.'
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
                let mintimetill = moment().endOf('day')
                let mintimetillend = moment().endOf('day')
                todayEvents.forEach(event => {
                  const startTime = moment(event.start)
                  const timetillend = moment(startTime)
                  const timetill = moment(startTime)
                  if (mintimetill.diff(timetill, 'seconds') > 0) {
                    mintimetill = timetill
                    mintimetillend = timetillend
                  }
                })
                if (
                  mintimetill.diff(moment(), 'seconds') < 0 &&
                  mintimetillend.diff(moment(), 'seconds') > 0
                ) {
                  scheduleOutput = `Loadshedding started ${mintimetill.fromNow()}\n${schedule.join(
                    '\n'
                  )}`
                } else if (
                  mintimetill.diff(moment(), 'seconds') > 0 &&
                  mintimetillend.diff(moment(), 'seconds') > 0
                ) {
                  scheduleOutput = `Loadshedding starts ${mintimetill.fromNow()}\n${schedule.join(
                    '\n'
                  )}`
                } else {
                  scheduleOutput = `Loadshedding ended ${mintimetillend.fromNow()}\n${schedule.join(
                    '\n'
                  )}`
                }
              }
              scheduleOutput =
                'Loadshedding Schedule:\n' + scheduleOutput
            } catch (error) {
              scheduleOutput = 'Loading loadshedding schedule'
              console.error('Error fetching load shedding schedule:', error)
            }
            const text = document.createElement('div')
            text.innerText = scheduleOutput
            return text
          }
        })
      }
    })
  }

  static fromXML (tag) {
    return new Loadshedding()
  }

  className () {
    return 'loadshedding'
  }
}
