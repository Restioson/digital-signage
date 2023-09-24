import { WithRefresh } from '../dynamic/with_refresh.mjs'
import { DeserializableWidget } from '../deserializable/deserializable_widget.mjs'
import { Container } from '../containers/container.mjs'
import { deserializeFreeFormContent } from './free_form_content_factory.mjs'
import { PaginatedContainer } from '../containers/paginated_container.mjs'
import { RSSItem } from './rss_item.mjs'
import { Root } from '../root.mjs'
import { ApiError } from '../../config.mjs'

const REFRESH_INTERVAL_MS = 5000
const RSS_REFRESH_INTERVAL_MS = 1000 * 60 * 60 // 1 hour

/**
 * A container which displays a live view of all the {@link FreeFormContent} on the server.
 *
 * @augments DeserializableWidget
 */
export class ContentStream extends DeserializableWidget {
  /**
   * @param {number[]} streams which content streams this widget subscribes to
   * @param {string[]} rssFeeds which RSS feeds to subscribe to
   * @param {?number} the amount of posts to fetch
   */
  constructor ({
    fetchAmount,
    streams,
    rssFeeds,
    pageSize,
    rotateEveryNSec,
    editable
  }) {
    super()
    this.children = []
    this.fetchAmount = fetchAmount || 5
    this.streams = streams || []
    this.rssFeeds = rssFeeds || []
    this.pageSize = parseInt(pageSize)
    this.page = -1
    this.rotationPeriod = (rotateEveryNSec || 10) * 1000
    this.refreshedTimes = 0
    this.editable = editable || false
  }

  /**
   * Fetch the latest content and update the state.
   *
   * @private
   * @returns {Promise<boolean>}
   */
  async refresh () {
    const params = this.streams.map(stream => `stream=${stream}`)
    const amt = this.fetchAmount ? `last=${this.fetchAmount}&` : ''
    const update = await fetch(`/api/content?${amt}${params.join('&')}`).then(
      res => res.json()
    )

    const rssRefresh =
      this.refreshedTimes %
        Math.floor(RSS_REFRESH_INTERVAL_MS / REFRESH_INTERVAL_MS) ===
      0

    let dirty = rssRefresh

    if (!dirty) {
      // eslint-disable-next-line space-in-parens
      let freeFormContentIdx = 0

      // Check if all the free form content children are the same
      for (let childIdx = 0; childIdx < this.children.length; childIdx++) {
        if (this.children[childIdx] instanceof RSSItem) {
          continue
        }

        dirty |=
          update.content[freeFormContentIdx].id !== this.children[childIdx].id

        if (dirty) {
          break
        }

        freeFormContentIdx++ // Only inc if this wasn't an RSS item
      }

      // Didn't have all the free form content children - must be refreshed
      dirty |= freeFormContentIdx !== update.content.length - 1
    }

    if (dirty) {
      const childrenAndPosted = update.content.map(
        content => [deserializeFreeFormContent(content), content.posted * 1000] // posted is in secs
      )

      if (rssRefresh) {
        for (const rss of this.rssFeeds) {
          const res = await fetch(rss)
          const text = await res.text()
          const dom = new window.DOMParser().parseFromString(text, 'text/xml')

          const items = Array.from(dom.querySelectorAll('item'))

          for (const item of items) {
            const published = new Date(
              item.querySelector('pubDate').textContent
            ).getTime()
            childrenAndPosted.push([RSSItem.parseFromXML(item), published])
          }
        }
      }

      childrenAndPosted.sort(
        ([_a, aPosted], [_b, bPosted]) => bPosted - aPosted
      )

      this.children = childrenAndPosted
        .slice(0, this.fetchAmount)
        .map(([child, _posted]) => child)
    }

    this.refreshedTimes += 1
    return dirty
  }

  static fromXML (tag) {
    return new ContentStream({
      fetchAmount: tag.attribute('fetch-amount'),
      streams: tag
        .children()
        .filter(stream => stream.attribute('id'))
        .map(stream => parseInt(stream.attribute('id')))
        .filter(id => id), // Ignore ids that don't parse
      rssFeeds: tag
        .children()
        .map(stream => stream.attribute('rss-url'))
        .filter(stream => stream), // Ignore streams without rss-url
      pageSize: tag.attribute('page-size'),
      rotateEveryNSec: tag.attribute('secs-per-page')
    })
  }

  build () {
    // Root is only available at build time so this is done here
    this.streams.push(Root.getInstance().getDisplayContentStream())

    return new WithRefresh({
      refresh: () => this.refresh(),
      period: REFRESH_INTERVAL_MS,
      builder: () => {
        let editableChildren
        // trying to incorporate the ID and streams that a post is a part of.
        // and ensure that each piece of the div is displayed on a new line/ and centrally aligned
        if (this.editable) {
          editableChildren = this.children.map(child => {
            const renderedChild = child.render()
            const childDiv = document.createElement('div')
            childDiv.appendChild(renderedChild)
            childDiv.className = 'deletable-content'
            const deleteButton = document.createElement('button')
            deleteButton.className = 'delete-content'
            deleteButton.addEventListener('click', event =>
              deleteContent(child.id, event)
            )
            deleteButton.textContent = 'Delete'
            childDiv.appendChild(deleteButton)

            const itemName = document.createElement('p')
            itemName.className = 'item-name'
            itemName.textContent = 'Post ID: ' + child.id
            childDiv.append(itemName)
            return childDiv
          })
        }
        if (this.pageSize) {
          this.page = -1
          return new WithRefresh({
            refresh: () => {
              this.page += 1
              return this.children.length > this.pageSize
            },
            period: this.rotationPeriod,
            builder: () => {
              return new PaginatedContainer({
                children: this.children,
                pageSize: this.pageSize,
                page: this.page > 0 ? this.page : 0
              })
            }
          })
        } else {
          return new Container({
            children: this.editable ? editableChildren : this.children
          })
        }
      }
    })
  }

  className () {
    return 'content-stream'
  }
}

/**
 * Delete a post. This can't be a form since HTML doesn't allow
 * `DELETE` as the method of a form.
 *
 * @param event the HTML button click event
 * @returns {Promise<void>}
 */
async function deleteContent (postId, event) {
  try {
    const res = await fetch(`/api/content/${postId}`, {
      method: 'delete'
    })

    if (res.status !== 200) {
      throw new ApiError(await res.text())
    }
    event.target.closest('.deletable-content').remove()
  } catch (err) {
    console.alert(err instanceof ApiError ? err.response : err.message)
  }
}
