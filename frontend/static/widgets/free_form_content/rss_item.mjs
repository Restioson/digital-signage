import { Widget } from '../widget.mjs'
import { Caption } from '../caption.mjs'
import { Qrcode } from '../qrcode.mjs'
import { Container } from '../containers/container.mjs'

export class RSSItem extends Widget {
  constructor ({ imageSrc, link, title, body }) {
    super()
    this.imageSrc = imageSrc
    this.link = link
    this.title = title
    this.body = body
  }

  static parseFromXML (item) {
    let imageSrc = null

    const imageEltLink = item.querySelector('image link')
    const imgElt = item.querySelector('img')
    const mediaElt = Array.from(
      item.getElementsByTagName('media:content')
    ).find(elt => elt.getAttribute('medium') === 'image')

    if (imageEltLink) {
      imageSrc = imageEltLink.textContent
    } else if (imgElt) {
      imageSrc = imgElt.src
    } else if (mediaElt) {
      imageSrc = mediaElt.getAttribute('url')
    }

    const titleElt = item.querySelector('title')
    const bodyElt = item.querySelector('description')
    const linkElt = item.querySelector(':scope > link')

    return new RSSItem({
      imageSrc,
      title: titleElt ? titleElt.textContent : null,
      link: linkElt ? linkElt.textContent : null,
      body: bodyElt ? bodyElt.textContent : null
    })
  }

  build () {
    const children = []

    if (this.imageSrc) {
      const image = document.createElement('img')
      image.src = this.imageSrc
      children.push(image)
    }

    if (this.link) {
      children.push(new Qrcode({ url: this.link }))
    }

    if (this.title || this.body) {
      const caption = new Caption({
        title: this.title,
        body: this.body
      }).render()
      const title = (caption.getElementsByClassName('caption-title') || [])[0]
      const body = (caption.getElementsByClassName('caption-body') || [])[0]

      if (title) {
        children.unshift(title)
      }

      if (body) {
        children.push(body)
      }
    }

    return new Container({ children })
  }

  className () {
    return 'free-form-content rss-item'
  }
}
