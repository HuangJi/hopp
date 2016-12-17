const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const http = require('http')
const debug = require('debug')('monitor:server')
const moment = require('moment')

const routes = require('./routes/index')
const api = require('./routes/api')

const fundRichUpdater = require('./daemon/fundRichUpdater')
const fundClearUpdater = require('./daemon/fundClearUpdater')

const app = express()

function normalizePort(val) {
  const nPort = parseInt(val, 10)
  if (isNaN(nPort)) {
    return val
  }
  if (nPort >= 0) {
    return nPort
  }
  return false
}

const port = normalizePort(process.env.PORT || '1337')

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.log(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.log(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

const server = http.createServer(app)
server.listen(port)
server.on('error', onError)

function onListening() {
  const addr = server.address()
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`
  debug(`Listening on ${bind}`)
  console.log(`Server is running on port: ${addr.port}`)
}

server.on('listening', onListening)


app.set('port', port)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers',
              'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  next()
})

app.use('/', routes)
app.use('/api', api)

// catch 404 and forward to error handler
app.use((req, res) => {
  const err = new Error('Not Found')
  err.status = 404
  res.status(404)
  res.render('page404', {})
  // next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err,
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {},
  })
})

// Update all per 24 hours.
const initialDateString = moment().utcOffset('+0800').format('YYYYMMDD')
fundRichUpdater.updateAll(initialDateString)
fundClearUpdater.updateAll(initialDateString)
// const source = 'fundRich'
// const type = 'FRAllocation'

// fundRichUpdater.getMissIdList(source, type, initialDateString, (missIdError, results) => {
//   if (missIdError) {
//     console.error(`missIdError:${missIdError}`)
//   } else {
//     console.log(`missId:${results}`)
//     if (type === 'FRDetail') {
//       for (const id of results) {
//         fundRichUpdater.updateOneFundRichDetailDataById(id, initialDateString)
//       }
//     } else if (type === 'FRNav') {
//       for (const id of results) {
//         fundRichUpdater.updateOneFundRichNavDataById(id, initialDateString)
//       }
//     } else if (type === 'FRAllocation') {
//       for (const id of results) {
//         fundRichUpdater.updateOneFundRichAllocationDataById(id, initialDateString)
//       }
//     } else if (type === 'FRDividend') {
//       for (const id of results) {
//         fundRichUpdater.updateOneFundRichDividendDataById(id, initialDateString)
//       }
//     }
//   }
// })

setInterval(() => {
  const currentDate = moment().utcOffset('+0800')
  if (currentDate.hours() === 11) fundRichUpdater.updateAll(currentDate.format('YYYYMMDD'))
}, 1000 * 3600 * 1)

setInterval(() => {
  const currentDate = moment().utcOffset('+0800')
  if (currentDate.hours() === 11) fundClearUpdater.updateAll(currentDate.format('YYYYMMDD'))
}, 1000 * 3600 * 1)
// setInterval(() => fundClearUpdater.updateAll(), 1000 * 3600 * 24)

module.exports = app
