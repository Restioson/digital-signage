import { Lecturer } from './lecturer.js'
import { Column } from './column.js'
import { Widget } from '../widget.mjs'

export class Department extends Widget {
  constructor () {
    super()
    this.lecturers = []
  }

  async refresh () {
    const update = await fetch('/api/lecturers').then(res => res.json())
    this.lecturers = update.lecturers
  }

  build () {
    return new Column({
      children: this.lecturers.map(Lecturer.fromJSON),
      classList: ['department']
    })
  }
}
