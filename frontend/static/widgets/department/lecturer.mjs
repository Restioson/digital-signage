import { Container } from '../containers/container.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'

/**
 * A {@link Widget} which displays a lecturers and all of their details.
 *
 * @augments Widget
 */
export class Lecturer extends DeserializableWidget {
  /**
   * @param {int} id the lecturer's id
   * @param {string} department the departments in which the lecturer works
   * @param {string} position the lecturer's position
   * @param {string} title the lecturer's title
   * @param {string} name the lecturer's name
   * @param {string} officeHours the lecturer's office hours
   * @param {string} officeLocation the lecturer's office location
   * @param {string} email the lecturer's email address
   * @param {string} phone the lecturer's phone number
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
