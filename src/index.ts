/// <reference path="./types/types.d.ts"/>
import express from 'express'
import session from 'express-session'
import morgan from 'morgan'
import path from 'path'
const MemoryStore = require('memorystore')(session)
import cookieParser from 'cookie-parser'

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

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jsx')
app.engine('jsx', require('express-react-views').createEngine())

app.get('/healthcheck', (req, res) =>
  res.send(
    `
<!DOCTYPE html>
<html>
<head><title>healthcheck</title></head>
<body>
<h1>healthcheck</h1>
<p>db status: <span id="dbstatus"></span><button id="btn">test</button></p>
<script>
const outputEl = document.getElementById('dbstatus')
const loading = () => {
  outputEl.style = "color: initial"
  outputEl.innerText = "loading..."
}
const succ = () => {
  outputEl.style = "color: green;"
  outputEl.innerText = "success"
}
const fail = () => {
  outputEl.style = "color: red;"
  outputEl.innerText = "fail"
}

document.getElementById('btn').addEventListener('click', () => {
  loading()
  fetch('/healthcheck/db')
    .then(res => {
      if (res.status === 200) {
        succ()
      } else {
        fail()
      }
    })
    .catch(e => {
      console.error(e)
      fail()
    })
})

</script>
</body>
</html>
`
  )
)
app.get('/healthcheck/db', async (req, res) => {
  try {
    await db.testConnection()
    return res.sendStatus(200)
  } catch (e) {
    console.error(`DB healthcheck failed`, e)
    return res.sendStatus(500)
  }
})

const robots = `User-agent: *
Disallow: /
`
app.get('/robots.txt', (req, res) => res.send(robots))

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
app.use('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../static/favicon.ico'))
})
app.use('/static', staticMiddleware)

app.use(async (req, res, next) => {
  const token = req.cookies.token as string | undefined

  if (!token) {
    const url = getUserServiceLoginUrl()
    return res.redirect(url)
  }

  try {
    const me = await getMe(token)
    if (!me.ok) {
      // TODO: 500 page
      console.error(`user service returned non-ok response`, me)
      return res.status(500).render('error-user-service')
    }

    const user = me.payload
    const noRights = {}
    ;(req as any).auth = {
      user,
      rights: isActiveMember(user)
        ? roleRights[user.role] || noRights
        : noRights
    } as AuthData
  } catch (e) {
    if (!e.response) {
      console.error('user-service getMe failed with no response', e)
      return res.status(500).render('error-user-service')
    }

    const status = e.response.status
    if (status >= 400 && status < 500) {
      // logged in to another service with current token, show login page again
      // so we get consent to this service as well
      const url = getUserServiceLoginUrl()
      return res.redirect(url)
    }

    // user service down?
    console.error('user-service /users/me failed', e, {
      status,
      data: e.response.data
    })
    return res.status(500).render('error-user-service')
  }

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
  const auth = (req as any).auth as AuthData | undefined

  res.status(404).render('404', {
    flash: req.flash(),
    username: auth && auth.user && auth.user.username
  })
})

app.listen(config.PORT, (err: any) => {
  if (err) {
    console.error('Failed to start server: ', err)
    return
  }

  console.log(`Server running on port ${config.PORT}`)
})
