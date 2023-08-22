import { Widget } from '../widget.mjs'
import { Container } from '../containers/container.mjs'

export class Lecturer extends Widget {
  constructor ({
    department,
    position,
    title,
    name,
    officeHours,
    officeLocation,
    email,
    phone
  }) {
    super()
    this.department = department
    this.position = position
    this.title = title
    this.name = name
    this.officeHours = officeHours
    this.officeLocation = officeLocation
    this.email = email
    this.phone = phone
  }

  static fromJSON (obj) {
    return new Lecturer({
      department: obj.department,
      position: obj.position,
      title: obj.title,
      name: obj.name,
      officeHours: obj.office_hours,
      officeLocation: obj.office_location,
      email: obj.email,
      phone: obj.phone
    })
  }

  build () {
    const title = document.createElement('h3')
    const body = document.createElement('p')

    title.innerText = `${this.title} ${this.name}`
    body.innerText =
      `Position: ${this.position} in the ${this.department} department\n` +
      `Office Hours: ${this.officeHours}\n` +
      `Office Location: ${this.officeLocation}\n` +
      `Email: ${this.email}\n` +
      `Phone: ${this.phone}`

    return new Container({ children: [title, body] })
  }
}
