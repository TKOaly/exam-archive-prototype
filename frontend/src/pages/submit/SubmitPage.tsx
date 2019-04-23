import React, { FunctionComponent, useState, useEffect } from 'react'
import TextField, { Input as TextFieldInput } from '@material/react-text-field'
import '@material/react-text-field/dist/text-field.css'
import { CourseListingItem } from '../../domain'
import ListingNavigation from '../common/ListingNavigation'
import CourseSelection from './CourseSelection'
import FileSelection from './FileSelection'
import './SubmitPage.scss'

type FetchableState<R> = [true, R] | [false, R]

const useFetchable = <R extends any>(
  fetcher: () => Promise<R>,
  initialData: R,
  inputs?: any[] | undefined
): FetchableState<R> => {
  const [state, setState] = useState<FetchableState<R>>([true, initialData])

  useEffect(() => {
    fetcher().then(data => {
      setState([false, data])
    })
  }, inputs)

  return state
}

const fetchCourses = async (): Promise<CourseListingItem[]> => {
  const res = await fetch('/api/courses')
  return await res.json()
}

const ControlTitle: FunctionComponent = ({ children }) => (
  <p className="submit-form__control-title">{children}</p>
)

interface Submission {
  file: File
  course: CourseListingItem
  fileName: string
}

interface SubmitFormProps {
  courses: CourseListingItem[]
  coursesLoading: boolean
  onSubmit: (submission: Submission) => void
}

const SubmitForm: FunctionComponent<SubmitFormProps> = ({
  courses,
  coursesLoading,
  onSubmit
}) => {
  const [file, setFile] = useState<File | undefined>()
  const [course, setCourse] = useState<CourseListingItem | undefined>()
  const [fileName, setFileName] = useState<string>('')

  const handleFileSelected = (file: File | undefined) => {
    console.log('file selected', file)
    setFile(file)

    if (file && fileName === '') {
      setFileName(file.name)
    }
  }

  const handleCourseChange = (value: CourseListingItem | undefined) => {
    console.log('handleCourseChange', { value })
    setCourse(value)
  }

  const handleFileNameChange = (e: any) => {
    console.log('handleFileNameChange', { value: e.currentTarget.value })
    setFileName(e.currentTarget.value)
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!file || !course || !fileName) {
      return
    }

    onSubmit({
      file,
      course,
      fileName
    })
  }

  const submitDisabled = !file || !course || !fileName

  return (
    <div className="submit-form">
      <ControlTitle>File</ControlTitle>
      <FileSelection selectedFile={file} onFileSelected={handleFileSelected} />

      <ControlTitle>Course</ControlTitle>
      <CourseSelection
        selectedCourse={course}
        isLoading={coursesLoading}
        courses={courses}
        onCourseSelected={handleCourseChange}
      />
      <ControlTitle>Document file name</ControlTitle>
      <TextField dense outlined className="submit-form__file-name">
        <TextFieldInput
          style={{ paddingTop: '7px' }}
          className="submit-form__file-name-input"
          onChange={handleFileNameChange}
          value={fileName}
        />
      </TextField>
      <div className="submit-form__submit-controls">
        <button disabled={submitDisabled} onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  )
}

const submitExam = async ({ course, file, fileName }: Submission) => {
  const formData = new FormData()
  formData.append('fileName', fileName)
  formData.append('exam', file)

  const res = await fetch(`/api/courses/${course.id}/exams`, {
    body: formData,
    method: 'POST'
  })
  const text = await res.text()
  console.log('fetch submit', res.status, text)
}

const SubmitPage = () => {
  const [areCoursesLoading, courses] = useFetchable(fetchCourses, [], [])
  const handleSubmit = submitExam

  return (
    <>
      <ListingNavigation
        title="Submit new document"
        backButtonHref="/courses"
      />
      <main className="submit-page">
        <SubmitForm
          onSubmit={handleSubmit}
          courses={courses}
          coursesLoading={areCoursesLoading}
        />
      </main>
    </>
  )
}

export default SubmitPage
