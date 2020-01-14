import express from 'express'
import slugify from 'slugify'
import {
  getCourseListing,
  getCourseInfo,
  deleteCourse,
  deleteExam,
  CourseNotFoundError,
  CannotDeleteError,
  findCourseByExamId
} from './service/archive'

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

type Role = 'jäsen' | 'tenttiarkistovirkailija' | 'virkailija' | 'ylläpitäjä'
type AccessRight = 'access' | 'upload' | 'remove'

interface AuthData {
  user: { username: string }
  role: Role
  rights: { [right in AccessRight]?: true }
}

router.use((req, res, next) => {
  const roleRights: {
    [role in Role]: { [right in AccessRight]?: true }
  } = {
    jäsen: { access: true, upload: true },
    tenttiarkistovirkailija: { access: true, upload: true, remove: true },
    virkailija: { access: true, upload: true },
    ylläpitäjä: { access: true, upload: true, remove: true }
  }
  ;(req as any).auth = {
    user: { username: 'hexjoona' },
    role: 'ylläpitäjä',
    rights: roleRights['ylläpitäjä']
  } as AuthData

  next()
})

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
      })),
    userRights: ((req as any).auth as AuthData).rights,
    username: ((req as any).auth as AuthData).user.username
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
    previousPageUrl: '/archive',
    userRights: ((req as any).auth as AuthData).rights,
    username: ((req as any).auth as AuthData).user.username
  })
})

router.post('/archive/delete-exam/:examId(\\d+)', async (req, res) => {
  try {
    const course = await findCourseByExamId(parseInt(req.params.examId, 10))

    if (!course) {
      // TODO handle
      return res.json({ error: 'todo' })
    }

    await deleteExam(parseInt(req.params.examId, 10))
    return res.redirect(urlForCourse(course.id, course.name))
  } catch (e) {
    console.error(e)
    // TODO: show flash message
    res.json({ error: e.message })
  }
})

router.post('/archive/delete-course/:courseId(\\d+)', async (req, res) => {
  try {
    await deleteCourse(parseInt(req.params.courseId, 10))
    return res.redirect('/archive')
  } catch (e) {
    // TODO: show flash messages
    if (e instanceof CourseNotFoundError) {
      return res.json({ error: e.message, type: 'CoirseNotFoundErr' })
    }
    if (e instanceof CannotDeleteError) {
      return res.json({ error: e.message, type: 'CAnnotDeleteDerro' })
    }
    return res.json({ error: e.message, wtf: true })
  }
})

export default router
