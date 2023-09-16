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

  static makeText(string,classname){
    const text = document.createElement('p')
    text.innerText = string
    text.className=classname
    return new Visibility({
      visible: Boolean(text),
      child: text
    })
  }

  static makeHeader(string){
    const text = document.createElement('h3')
    text.innerText = string
    text.className='person_header'
    return new Visibility({
      visible: Boolean(text),
      child: text
    })
  }

  static makeImage(url){
    const imageElement = document.createElement('img')
    imageElement.src = url
    imageElement.className="person_image"
    return imageElement
  }

  build () {
    return new Container({ children: [
      makeHeader(`${this.title} ${this.name}`),
      makeImage(`data:${this.mimeType};base64,${this.imageData}`),
      makeText(`Position: ${this.position}`,"person_position" ),
      makeText(`Office Hours: ${this.officeHours}`,"person_hours" ),
      makeText(`Office Location: ${this.officeLocation}`,"person_location" ),
      makeText(`Email: ${this.email}`,"person_email" ),
      makeText(`Phone: ${this.phone}`,"person_phone" ),
    ] })

    // const title = document.createElement('h3')
    // const body = document.createElement('p')
    // const dataUrl = `data:${this.mimeType};base64,${this.imageData}`

    // const imageElement = document.createElement('img')
    // imageElement.src = dataUrl

    // title.innerText = `${this.title} ${this.name}`
    // body.innerText =
    //   `Position: ${this.position}` +
    //   `Office Hours: ${this.officeHours}` +
    //   `Office Location: ${this.officeLocation}` +
    //   `Email: ${this.email}` +
    //   `Phone: ${this.phone}`

    // return new Container({ children: [title, imageElement, body] })
  }

  className () {
    return 'person'
  }
}

