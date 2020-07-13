/// <reference path="./types.d.ts"/>
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import path from 'path'
const MemoryStore = require('memorystore')(session)
import cookieParser from 'cookie-parser'
import AWS from 'aws-sdk'

import config from './config'
import * as db from './db'
import apiRouter from './api'
import downloadRouter from './download'
import controller from './controller'
import {
  getUserServiceLoginUrl,
  getUserServiceLogoutUrl,
  getMe
} from './service/tkoUserService'
import { isActiveMember, AuthData, roleRights, requireRights } from './common'

if (process.env.NODE_ENV === 'development') {
  AWS.config.update({
    region: config.AWS_REGION,
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  })
} else {
  AWS.config.update({
    region: config.AWS_REGION
  })
}

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jsx')
app.engine('jsx', require('express-react-views').createEngine())

app.use(cookieParser())
app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'))

app.use(
  session({
    cookie: {
      maxAge: 86400000,
      httpOnly: true,
      sameSite: 'strict'
    },
    // TODO: persistent storage
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

const staticMiddleware = express.static(path.join(__dirname, '../static'))
app.get('/favicon.ico', (req, res) => res.sendStatus(404))
app.use('/static', staticMiddleware)

app.use(async (req, res, next) => {
  const token = req.cookies.token as string | undefined

  if (!token) {
    const url = getUserServiceLoginUrl()
    return res.redirect(url)
  }

  const me = await getMe(token)
  if (!me.ok) {
    // TODO: 500 page
    return res.status(500).send('fail user service')
  }

  const user = me.payload
  const noRights = {}
  ;(req as any).auth = {
    user,
    rights: isActiveMember(user) ? roleRights[user.role] || noRights : noRights
  } as AuthData
  next()
})

app.use('/logout', (req, res) => {
  if (!req.cookies.token) {
    return res.redirect('/')
  }
  return res.redirect(getUserServiceLogoutUrl())
})

app.use('/', requireRights('access'), controller)

app.use('/api', requireRights('access'), apiRouter)
app.use('/download', requireRights('access'), downloadRouter)

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
