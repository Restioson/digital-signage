import { JSDOM } from 'jsdom'

const dom = new JSDOM(
  `<html lang="en">
   <body>
      <div id="root"></div>
   </body>
 </html>`,
  { url: 'http://127.0.0.1:5001' }
)
global.window = dom.window
global.document = dom.window.document
