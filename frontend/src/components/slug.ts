import slugify from 'slugify'

export const generateCourseSlug = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: true,
    replacement: '-',
    remove: /[^\w\d -]/g
  })
}

export const generateCourseFilename = (courseName: string) => {
  return slugify(courseName.replace(/c\+\+/i, 'cpp'), {
    lower: false,
    replacement: '_',
    remove: /[^\w\d -]/g
  })
}
