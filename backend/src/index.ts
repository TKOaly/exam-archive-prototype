import express from 'express'
import config from './config'
import * as db from './db'
import api from './api'

const app = express()

app.use('/api', api)
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
