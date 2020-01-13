import express from 'express'
import morgan from 'morgan'
import path from 'path'

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

app.use('/static', express.static(path.join(__dirname, '../static')))

app.use('/', controller)

app.use('/api', apiRouter)
app.use('/download', downloadRouter)
app.use('*', (req, res, next) => res.status(404).json({ error: 'not found' }))

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
