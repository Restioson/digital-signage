import { Widget } from '../widget.mjs'
import { Container } from '../containers/container.mjs'

/**
 * A {@link Widget} which displays a lecturer and all of their details.
 *
 * @augments Widget
 */
export class Lecturer extends Widget {
  /**
   * @param {string} department the department in which the lecturer works
   * @param {string} position the lecturer's position
   * @param {string} title the lecturer's title
   * @param {string} name the lecturer's name
   * @param {string} officeHours the lecturer's office hours
   * @param {string} officeLocation the lecturer's office location
   * @param {string} email the lecturer's email address
   * @param {string} phone the lecturer's phone number
   */
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

  /**
   * Deserialize the Lecturer from its JSON API representation.
   *
   * @param obj
   * @returns {Lecturer}
   */
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
