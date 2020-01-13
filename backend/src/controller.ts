import express from 'express'
import slugify from 'slugify'
import { getCourseListing, getCourseInfo } from './service/archive'

const slugifyCourseName = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: true,
    replacement: '-',
    remove: /[^\w\d \-]/g
  })
}

const slugifyCourseFilename = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: false,
    replacement: '_',
    remove: /[^\w\d \-]/g
  })
}

const router = express.Router()

const urlForCourse = (id: number, name: string) =>
  `/archive/${id}-${slugifyCourseName(name)}`

router.get('/archive', async (req, res) => {
  const list = await getCourseListing()
  res.render('index', {
    courses: list
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(({ id, name, lastModified }) => ({
        id,
        name,
        lastModified,
        url: urlForCourse(id, name)
      }))
  })
})

const examDownloadUrl = (examId: number, fileName: string) =>
  `/download/${examId}/${fileName}`

router.get('/archive/:id(\\d+)-?:courseSlug?', async (req, res, next) => {
  const { id: unparsedId, courseSlug } = req.params

  const id = parseInt(unparsedId, 10)
  if (isNaN(id)) {
    return next()
  }

  const course = await getCourseInfo(id)
  if (course === null) {
    return next()
  }

  if (courseSlug !== slugifyCourseName(course.name)) {
    return res.redirect(302, urlForCourse(course.id, course.name))
  }

  res.render('course', {
    course,
    exams: course.exams.map(exam => ({
      ...exam,
      downloadUrl: examDownloadUrl(exam.id, exam.fileName)
    })),
    previousPageUrl: '/archive'
  })
})

export default router
