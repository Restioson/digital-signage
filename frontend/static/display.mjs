import { ContentStream } from './widgets/free_form_content/content_stream.mjs'
import { Department } from './widgets/department/department.mjs'
import { Container } from './widgets/containers/container.mjs'
import { Root } from './widgets/root.mjs'

export function main () {
  Root.create({
    child: new Container({
      children: [new Department(), new ContentStream()]
    }),
    targetElement: document.getElementById('root')
  })
}
