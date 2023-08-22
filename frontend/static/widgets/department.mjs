import { Lecturer } from './lecturer.js'
import { Container } from './container.js'
import { Widget } from './widget.mjs'
import { WithClasses } from './with_classes.mjs'

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
    return new WithClasses({
      classList: ['department'],
      child: new Container({
        children: this.lecturers.map(Lecturer.fromJSON)
      })
    })
  }
}
