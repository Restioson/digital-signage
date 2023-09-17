import { Container } from '../containers/container.mjs'
import { Visibility } from '../visibility.mjs'
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
   * @param {string} mimeType the mime type of the image blob
   * @param {bytes} imageData the image blob
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
    mimeType,
    imageData,
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
    this.mimeType = mimeType
    this.imageData = imageData
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
      mimeType: obj.mime_type,
      imageData: obj.image_data,
      officeHours: obj.office_hours,
      officeLocation: obj.office_location,
      email: obj.email,
      phone: obj.phone
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

  static makeImage (url, value) {
    const imageElement = document.createElement('img')
    imageElement.src = `/api/departments/${this.department}/people/${
      this.id
    }/image`
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
        Person.makeImage(
          `data:${this.mimeType};base64,${this.imageData}`,
          this.imageData
        ),
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
