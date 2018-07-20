const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'

const { createServer } = require('http')
const { join } = require('path')
const { parse } = require('url')
const next = require('next')
const mobxReact = require('mobx-react')

const app = next({ dev })
const handle = app.getRequestHandler()

mobxReact.useStaticRendering(true)

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    const ua = req.headers['user-agent']

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)

      app.serveStatic(req, res, filePath)
    } else if (/Mobile/i.test(ua) && pathname.indexOf('/m') === -1) {
      const mobilePathname = pathname === '/' ? '/m' : `/m${pathname}`

      app.render(req, res, mobilePathname, query)
    } else if (!/Mobile/i.test(ua) && pathname.indexOf('/m/') > -1) {
      app.render(req, res, pathname.slice(2), query)
    } else if (!/Mobile/i.test(ua) && pathname.indexOf('/m') > -1) {
      app.render(req, res, '/', query)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(port, err => {
    if (err) throw err

    console.log(`> Ready on http://localhost:${port}`)
  })
})
