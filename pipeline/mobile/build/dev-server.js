import path from 'path'
import express from 'express'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import proxyMiddleware from 'http-proxy-middleware'
import bodyParser from 'body-parser'
import history from 'connect-history-api-fallback'

import devConf from './webpack.dev.conf.babel'
import ajaxMiddleware from './ajax-middleware'
import config from './config'
import checkVer from './check-versions'

checkVer()

const port = process.env.PORT || config.dev.port

const proxyTable = config.dev.proxyTable

const app = express()
const compiler = webpack(devConf)

const devMiddleware = webpackDevMiddleware(compiler, {
    publicPath: devConf.output.publicPath,
    quiet: true
})

const hotMiddleware = webpackHotMiddleware(compiler, {
    log: false,
    heartbeat: 2000
})

Object.keys(proxyTable).forEach(context => {
    let options = proxyTable[context]
    if (typeof options === 'string') {
        options = {
            target: options
        }
    }
    app.use(proxyMiddleware(context, options))
})

app.use(history({
    verbose: false,
    rewrites: [
        {
            // connect-history-api-fallback 默认会对 url 中有 . 的 url 当成静态资源处理而不是当成页面地址来处理
            // 兼容 /cs/28aa9eda67644a6eb254d694d944307e/cluster/BCS-MESOS-10001/node/10.121.23.12 这样以 IP 结尾的 url
            // from: /\d+\.\d+\.\d+\.\d+$/,
            from: /(\d+\.)*\d+$/,
            to: '/'
        },
        {
            // connect-history-api-fallback 默认会对 url 中有 . 的 url 当成静态资源处理而不是当成页面地址来处理
            // 兼容 /bcs/projectId/app/214/taskgroups/0.application-1-13.test123.10013.1510806131114508229/containers/containerId
            from: /\/+.*\..*\//,
            to: '/'
        }
    ]
}))

app.use(devMiddleware)

app.use(hotMiddleware)

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(ajaxMiddleware)

// const staticMiddleware = express.static('dist')
// app.use(staticMiddleware)
const staticPath = path.posix.join(config.dev.assetsPublicPath, config.dev.assetsSubDirectory)
app.use(staticPath, express.static('./static'))

let _resolve
const readyPromise = new Promise(resolve => {
    _resolve = resolve
})

devMiddleware.waitUntilValid(() => {
    console.log('> Starting dev server...')
    _resolve()
})

const server = app.listen(port)

export default {
    ready: readyPromise,
    close: () => {
        server.close()
    }
}
