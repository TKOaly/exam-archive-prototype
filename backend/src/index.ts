/// <reference path="./types.d.ts"/>
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import path from 'path'
const MemoryStore = require('memorystore')(session)

import config from './config'
import * as db from './db'
import apiRouter from './api'
import downloadRouter from './download'
import controller from './controller'

const app = express()

app.set('views', __dirname + '/views')
app.set('view engine', 'jsx')
app.engine('jsx', require('express-react-views').createEngine())

app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.use(
  session({
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      sameSite: 'strict'
    },
    store: new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: config.COOKIE_SECRET,
    // don't need resave because memorystore implements touch
    resave: false,
    saveUninitialized: false
  })
)

app.use((req, res, next) => {
  req.flash = (message?: string, type?: 'error' | 'info') => {
    if (typeof message === 'undefined' && typeof type === 'undefined') {
      const ret = req.session!['__flash']
      req.session!['__flash'] = undefined
      return ret
    } else {
      req.session!['__flash'] = { message, type }
    }
  }

  next()
})

app.use('/static', express.static(path.join(__dirname, '../static')))

app.use('/', controller)

app.use('/api', apiRouter)
app.use('/download', downloadRouter)

app.use('*', (req, res) => {
  res.render('404')
})

const start = async () => {
  try {
    await db.testConnection()
  } catch (err) {
    console.error('Database connection failed', err)
    process.exit(1)
  }

  app.listen(config.PORT, (err: any) => {
    if (err) {
      console.error('Failed to start server: ', err)
      return
    }

    console.log(`Server running on port ${config.PORT}`)
  })
}

start()
