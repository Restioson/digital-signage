import { Container } from '../containers/container.mjs'
import { Widget } from '../widget.mjs'

/**
 * A {@link Widget} which displays a people and all of their details.
 *
 * @augments Widget
 */
export class Person extends Widget {
  /**
   * @param {int} id the person's id
   * @param {string} department the departments in which the person works
   * @param {string} position the person's position
   * @param {string} title the person's title
   * @param {string} name the person's name
   * @param {string} officeHours the person's office hours
   * @param {string} officeLocation the person's office location
   * @param {string} email the person's email address
   * @param {string} phone the person's phone number
   */
  constructor ({
    id,
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
    this.id = id
    this.department = department
    this.position = position
    this.title = title
    this.name = name
    this.officeHours = officeHours
    this.officeLocation = officeLocation
    this.email = email
    this.phone = phone
  }

  /**
   * Deserialize the Person from its JSON API representation.
   *
   * @param obj
   * @returns {Person}
   */
  static fromJSON (obj) {
    return new Person({
      id: obj.id,
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
      `Position: ${this.position}\n` +
      `Office Hours: ${this.officeHours}\n` +
      `Office Location: ${this.officeLocation}\n` +
      `Email: ${this.email}\n` +
      `Phone: ${this.phone}`

    return new Container({ children: [title, body] })
  }
}
