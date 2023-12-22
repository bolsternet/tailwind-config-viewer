const Koa = require('koa')
const serve = require('koa-static')
const mount = require('koa-mount')

const Router = require('@koa/router')
const portfinder = require('portfinder')
const open = require('open')
const { resolveConfig } = require('../lib/tailwindConfigUtils')

function createServer ({
  port = 3000,
  tailwindConfigProvider,
  shouldOpen,
  routerPrefix = ''
}) {
  const app = new Koa()

  var mountPath = routerPrefix
  if (mountPath === '') mountPath = '/'

  const router = new Router({ prefix: routerPrefix })

  router.get('/config.json', (ctx) => {
    ctx.body = resolveConfig(tailwindConfigProvider())
  })

  app
    .use((ctx, next) => {
      if (ctx.url === routerPrefix) {
        return ctx.redirect(routerPrefix + '/index.html')
      } else {
        return next()
      }
    })
    .use(mount(mountPath, serve(`${__dirname}/../dist`)))
    .use(router.routes())
    .use(router.allowedMethods())

  return {
    app,
    asMiddleware: () => {
      return app.callback()
    },
    start: () => {
      portfinder.getPort({
        port
      }, (err, port) => {
        if (err) {
          throw (err)
        }

        app.listen(port, async () => {
          console.log('Server Started ∹ http://localhost:' + port.toString() + routerPrefix)

          if (shouldOpen) {
            open('http://localhost:' + port.toString())
          }
        })
      })
    }
  }
}

module.exports = createServer
