import { DeserializableWidget } from './deserializable/deserializable_widget.mjs'
import { importFromNpm } from '../util.mjs'
import { Root } from './root.mjs'
const { default: YoutubePlayer } = await importFromNpm('youtube-player')

export class YoutubeVideo extends DeserializableWidget {
  constructor ({ videoId, controlsPageTime }) {
    super()
    this.videoId = videoId
    this.controlsPageTime = controlsPageTime
  }

  build () {
    const element = document.createElement('div')

    Root.getInstance().watchElement({
      element,
      onAdd: () => {
        const player = YoutubePlayer(element, {
          videoId: this.videoId,
          playerVars: { autoplay: 1, controls: 0 }
        })
        player.mute()
        player.playVideo()

        player.on('stateChange', event => {
          if (event.data === 0) {
            if (this.controlsPageTime) {
              event.target.getIframe().getRootNode().host.dataset.done = 'true'
              player.mute()
            } else {
              player.mute()
              event.target.playVideo()
            }
          }
        })
      }
    })

    return element
  }

  className () {
    return 'video'
  }

  static fromXML (tag) {
    return new YoutubeVideo({
      videoId: tag.attribute('id'),
      controlsPageTime: tag.attribute('controls-page-time') || false
    })
  }
}
