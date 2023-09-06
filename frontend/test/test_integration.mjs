import child_process from 'child_process' // eslint-disable-line camelcase
import { JSDOM } from 'jsdom'
import assert from 'assert'
import { URL } from 'url'
import { open } from 'node:fs/promises'
import { Blob } from 'buffer'
import {
  Root,
  testExports as rootTestExports
} from '../static/widgets/root.mjs'
import { ContentStream } from '../static/widgets/free_form_content/content_stream.mjs'
import { Container } from '../static/widgets/containers/container.mjs'
import {
  checkRenderedLinkCaptionedTitleBody,
  checkRenderedLocalImage,
  checkRenderedQrcodeCaptionedTitleBody,
  checkRenderedRemoteImage,
  checkRenderedText
} from './test_free_form_content.mjs'
import { checkRenderedLecturer } from './test_department.mjs'
import { Department } from '../static/widgets/department/department.mjs'
import { deserializeWidget } from '../static/widgets/deserializable/widget_deserialization_factory.mjs'

let serverProcess

async function fetchContent () {
  const res = await fetch('/api/content')
  assert.equal(res.status, 200)
  return (await res.json()).content
}

/**
 * Upload the given content to the server.
 *
 * @param {Object} formData the data to upload
 * @returns {Promise<Object>} data expected to be fetched from the remote server upon the next `GET /api/content`
 */
async function uploadContent (formData) {
  const res = await fetch('/api/content', {
    method: 'post',
    // FormData always encodes as multipart/form-data so urlencoded data needs to be converted
    body: new URLSearchParams(formData)
  })

  const expected = await res.json()

  for (const prop in formData) {
    if (prop === 'caption_title') {
      expected.caption = expected.caption || {}
      expected.caption.title = formData[prop]
    } else if (prop === 'caption_body') {
      expected.caption = expected.caption || {}
      expected.caption.body = formData[prop]
    } else {
      expected[prop] = formData[prop]
    }
  }

  assert.equal(res.status, 200)
  return expected
}

async function uploadLocalImage () {
  const formData = new FormData()
  formData.append('type', 'local_image')
  const file = await open('../backend/test/data/test.jpg')
  const buffer = (await file.read()).buffer
  await file.close()
  formData.append(
    'image_data',
    new Blob([buffer], { mime: 'image/jpeg' }),
    'test.jpg'
  )

  const res = await fetch('/api/content', {
    method: 'post',
    body: formData
  })
  assert.equal(res.status, 200)
  return { type: 'local_image', ...(await res.json()) }
}

/**
 * Upload one piece of content and check if it is returned when `GET`ting from `/api/content`
 * @param content
 * @returns {Promise<void>}
 */
async function checkUploadOne (content) {
  const expected = await uploadContent(content)
  const fetched = await fetchContent()
  assert.deepStrictEqual(fetched, [expected])
}

async function uploadLecturer (formData) {
  const res = await fetch('/api/lecturers', {
    method: 'post',
    // FormData always encodes as multipart/form-data so urlencoded data needs to be converted
    body: new URLSearchParams(formData)
  })
  assert.equal(res.status, 200)
  return (await res.json()).id
}

async function checkUploadLecturer (formData) {
  const res = await fetch('/api/lecturers', {
    method: 'post',
    // FormData always encodes as multipart/form-data so urlencoded data needs to be converted
    body: new URLSearchParams(formData)
  })
  assert.equal(res.status, 200)
  const id = (await res.json()).id

  const fetchAllRes = await fetch('/api/lecturers')
  assert.equal(fetchAllRes.status, 200)
  const lecturers = (await fetchAllRes.json()).lecturers

  assert.equal(lecturers.length, 1)
  const fetched = lecturers[0]
  assert.equal(fetched.id, id)

  assert.deepStrictEqual(fetched, { id, ...formData })
  return id
}

async function sleepMs (ms) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

describe('API Integration', function () {
  beforeEach(async function () {
    // eslint-disable-next-line camelcase
    serverProcess = child_process.spawn('../venv/bin/flask', [
      '--app',
      'server.main:create_app(testing=True)',
      'run'
    ])

    const base = 'http://localhost:5000'

    const dom = new JSDOM(
      `<html lang="en">
         <body>
            <div id="root"></div>
         </body>
       </html>`,
      { url: base }
    )

    const oldFetch = global.fetch
    global.fetch = function (url, ...rest) {
      return oldFetch(new URL(url, base), ...rest)
    }

    let started = false
    for (let tries = 0; tries < 4; tries++) {
      try {
        if ((await (await fetch('/api/health')).json()).healthy === true) {
          started = true
          break
        }
      } catch (e) {
        await sleepMs(250)
      }
    }

    assert.ok(started, 'Server did not start')

    global.window = dom.window
    global.document = dom.window.document

    Root.create({
      child: new Container({ children: [] }),
      targetElement: document.getElementById('root')
    })
  })

  afterEach(async function () {
    await serverProcess.kill()
    rootTestExports.destroyRoot()
  })

  describe('/api/content', function () {
    describe('Text', function () {
      it('uploads', async function () {
        await checkUploadOne({
          type: 'text',
          title: 'title hello',
          body: 'body hello'
        })
      })
    })

    describe('Link', function () {
      it('uploads', async function () {
        await checkUploadOne({
          type: 'link',
          url: 'https://example.com/',
          caption_title: 'title hello',
          caption_body: 'body hello'
        })
      })
    })

    describe('RemoteImage', function () {
      it('uploads', async function () {
        await checkUploadOne({
          type: 'remote_image',
          src: 'https://example.com/'
        })
      })
    })

    describe('LocalImage', function () {
      it('uploads', async function () {
        const expected = await uploadLocalImage()
        assert.deepStrictEqual(await fetchContent(), [expected])
      })
    })

    describe('ContentStream', function () {
      describe('refresh', function () {
        it('should result in empty content list with empty database', async function () {
          const stream = new ContentStream()
          assert.deepStrictEqual(stream.cache.children, [])
          await stream.refresh()
          assert.deepStrictEqual(stream.cache.children, [])
        })

        it('should fetch and render all content correctly', async function () {
          const content = [
            {
              type: 'remote_image',
              src: 'https://example.com/'
            },
            {
              type: 'link',
              url: 'https://example.com/',
              caption_title: 'title hello',
              caption_body: 'body hello'
            },
            {
              type: 'qrcode_content',
              url: 'https://example.com/',
              caption_title: 'title hello',
              caption_body: 'body hello'
            },
            {
              type: 'text',
              title: 'title hello',
              body: 'body hello'
            }
          ]

          const expected = []
          for (const post of content) {
            expected.push(await uploadContent(post))
            await sleepMs(1000) // Force them to be posted at different times
          }

          expected.push(await uploadLocalImage())

          // Content is shown latest to oldest, so reverse the expected list
          expected.reverse()

          const stream = new ContentStream()
          assert.deepStrictEqual(stream.cache.children, [])

          await stream.refresh()
          assert.deepStrictEqual(
            stream.cache.children,
            expected.map(deserializeWidget)
          )

          const out = stream.render()
          assert.equal(out.tagName, 'DIV')
          assert.equal(out.children.length, 5)

          checkRenderedLocalImage(out.children[0], expected[0].id)
          checkRenderedText(
            out.children[1],
            expected[1].title,
            expected[1].body
          )
          checkRenderedLinkCaptionedTitleBody(
            out.children[3],
            expected[3].url,
            expected[3].caption.title,
            expected[3].caption.body
          )
          checkRenderedQrcodeCaptionedTitleBody(
            out.children[2],
            expected[2].url,
            expected[2].caption.title,
            expected[2].caption.body
          )

          checkRenderedRemoteImage(out.children[4], expected[4].src)
        }).timeout(5000)
      })
    })
  })

  describe('/api/lecturers', function () {
    describe('Lecturer', function () {
      it('uploads', async function () {
        const formData = {
          department: 'testDept',
          email: 'myemail@example.com',
          name: 'John Doe',
          office_hours: '10am-9pm on Wednesdays',
          office_location: 'CS302',
          phone: '021 111 1111',
          position: 'Professor',
          title: 'Prof'
        }

        await checkUploadLecturer(formData)
      })

      it('edits', async function () {
        const formData = {
          department: 'testDept',
          email: 'myemail@example.com',
          name: 'John Doe',
          office_hours: '10am-9pm on Wednesdays',
          office_location: 'CS302',
          phone: '021 111 1111',
          position: 'Professor',
          title: 'Prof'
        }

        const id = await checkUploadLecturer(formData)

        let newId = await checkUploadLecturer({ id, ...formData })
        assert.equal(id, newId, 'id should be unchanged after edit')

        formData.department = 'otherDept'
        formData.email = 'otherEmail@example.com'

        newId = await checkUploadLecturer({ id, ...formData })
        assert.equal(id, newId, 'id should be unchanged after edit')
      })
    })

    describe('Department', function () {
      describe('refresh', function () {
        it('should result in empty lecturers list with empty database', async function () {
          const dept = new Department()
          assert.deepStrictEqual(dept.cache.children, [])
          await dept.refresh()
          assert.deepStrictEqual(dept.cache.children, [])
        })

        it('should fetch and render all lecturers correctly', async function () {
          const lecturers = [
            {
              department: 'CS',
              email: 'myemail@example.com',
              name: 'John Doe',
              office_hours: '10am-9pm on Wednesdays',
              office_location: 'CS302',
              phone: '021 111 1111',
              position: 'Professor',
              title: 'Prof'
            },
            {
              department: 'Maths',
              email: 'notmyemail@example.org',
              name: 'Jamie Doe',
              office_hours: '11am-10pm on Thursdays',
              office_location: 'Maths 301',
              phone: '021 222 22222',
              position: 'Teaching Assistant',
              title: 'Ms'
            }
          ]

          for (const lecturer of lecturers) {
            await uploadLecturer(lecturer)
          }

          const dept = new Department()
          assert.deepStrictEqual(dept.cache.children, [])

          await dept.refresh()

          const out = dept.render()
          assert.equal(out.tagName, 'DIV')
          assert.equal(out.children.length, 2)

          for (let i = 0; i < 2; i++) {
            const expected = {
              officeHours: lecturers[i].office_hours,
              officeLocation: lecturers[i].office_location,
              ...lecturers[i]
            }
            checkRenderedLecturer(out.children[i], expected)
          }
        })
      })
    })
  })
})
