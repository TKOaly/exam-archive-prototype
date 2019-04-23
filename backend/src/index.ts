import express from 'express'
import config from './config'
import { getCourseListing, getCourseInfo } from './service/archive'
import * as db from './db'

const app = express()

const api = express.Router()

api.get('/courses', async (req, res) => {
  const courses = await getCourseListing()
  res.json(courses)
})

api.get('/courses/:courseId', async (req, res, next) => {
  const courseId = parseInt(req.params.courseId, 10)
  if (isNaN(courseId)) {
    return next()
  }

  const course = await getCourseInfo(courseId)
  if (course === null) {
    return next()
  }
  res.json(course)
})

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
