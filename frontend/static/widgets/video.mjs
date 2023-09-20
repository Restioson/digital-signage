import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'

export class Video extends DeserializableWidget {
  constructor ({ src, controlsPageTime }) {
    super()
    this.src = src
    this.controlsPageTime = controlsPageTime
  }

  build () {
    const video = document.createElement('video')
    video.autoplay = true
    video.muted = true

    const source = document.createElement('source')
    source.src = this.src
    video.appendChild(source)

    console.log(this.controlsPageTime)
    video.addEventListener('ended', evt => {
      if (this.controlsPageTime) {
        evt.target.getRootNode().host.dataset.done = 'true'
      } else {
        evt.target.play()
      }
    })

    return video
  }

  className () {
    return 'video'
  }

  static fromXML (tag) {
    return new Video({
      src: tag.attribute('src'),
      controlsPageTime: tag.attribute('controls-page-time') || false
    })
  }
}
