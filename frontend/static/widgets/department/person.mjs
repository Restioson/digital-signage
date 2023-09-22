import { Container } from '../containers/container.mjs'
import { Visibility } from '../visibility.mjs'
import { Widget } from '../widget.mjs'
import { Root } from '../root.mjs'

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
   * @param {boolean} hasimage the person's phone number
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
    phone,
    hasimage
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
    this.hasimage = hasimage
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
      phone: obj.phone,
      department: Root.getInstance().getDepartment(),
      hasimage: obj.image
    })
  }

  static makeText (string, classname, value) {
    const text = document.createElement('p')
    text.innerText = string
    text.className = classname
    return new Visibility({
      visible: Boolean(value),
      child: text
    })
  }

  static makeHeader (string) {
    const text = document.createElement('h3')
    text.innerText = string
    text.className = 'person_header'
    return new Visibility({
      visible: Boolean(text),
      child: text
    })
  }

  static makeImage (department, id, value) {
    if (value === 'false') {
      value = false
    } else {
      value = true
    }
    const imageElement = document.createElement('img')
    imageElement.src = `/api/departments/${department}/people/${id}/image`
    imageElement.className = 'person_image'
    return new Visibility({
      visible: Boolean(value),
      child: imageElement
    })
  }

  build () {
    return new Container({
      children: [
        Person.makeHeader(`${this.title} ${this.name}`),
        Person.makeImage(this.department, this.id, this.hasimage),
        Person.makeText(
          `Position: ${this.position}`,
          'person_position',
          this.position
        ),
        Person.makeText(
          `Office Hours: ${this.officeHours}`,
          'person_hours',
          this.officeHours
        ),
        Person.makeText(
          `Office Location: ${this.officeLocation}`,
          'person_location',
          this.officeLocation
        ),
        Person.makeText(`Email: ${this.email}`, 'person_email', this.email),
        Person.makeText(`Phone: ${this.phone}`, 'person_phone', this.phone)
      ]
    })
  }

  className () {
    return 'person'
  }
}
