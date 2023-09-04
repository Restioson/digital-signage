import { Widget } from '../widget.mjs'
import { Container } from '../containers/container.mjs'

/**
 * A {@link Widget} which displays a lecturers and all of their details.
 *
 * @augments Widget
 */
export class Lecturer extends Widget {
  /**
   * @param {int} id the lecturers's id
   * @param {string} department the department in which the lecturers works
   * @param {string} position the lecturers's position
   * @param {string} title the lecturers's title
   * @param {string} name the lecturers's name
   * @param {string} officeHours the lecturers's office hours
   * @param {string} officeLocation the lecturers's office location
   * @param {string} email the lecturers's email address
   * @param {string} phone the lecturers's phone number
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
   * Deserialize the Lecturer from its JSON API representation.
   *
   * @param obj
   * @returns {Lecturer}
   */
  static fromJSON (obj) {
    return new Lecturer({
      id: obj.id,
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
      `Department: ${this.department}\n` +
      `Position: ${this.position}\n` +
      `Office Hours: ${this.officeHours}\n` +
      `Office Location: ${this.officeLocation}\n` +
      `Email: ${this.email}\n` +
      `Phone: ${this.phone}`

    return new Container({ children: [title, body] })
  }
}
