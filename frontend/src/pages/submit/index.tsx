import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from 'react'
import { History } from 'history'
import cz from 'classnames'

import { CourseListingItem, Document } from '../../domain'
import ListingNavigation from '../../components/ListingNavigation'
import CourseSelection from '../../components/submit/CourseSelection'
import FileSelection from '../../components/submit/FileSelection'
import { ControlGroup } from '../../components/submit/FormControls'
import FileNamePicker from '../../components/submit/FileNamePicker'
import './index.scss'

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

const Button: FunctionComponent<React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & { variant?: 'primary' | 'secondary' }> = ({
  variant = 'primary',
  ...buttonProps
}) => {
  const { className, disabled } = buttonProps

  return (
    <button
      className={cz('my-button', className, {
        [`my-button--${variant}`]: variant,
        'my-button--disabled': disabled
      })}
      {...buttonProps}
    />
  )
}

/** Extracts the extension from a file name, or undefined if none found. Preserves `.` in front of extension. */
const extractExtension = (fileName: string) => {
  // just split by . and remove the first part which is the file name without extension
  const ext = fileName
    .split('.')
    .slice(1)
    .join('.')
  return ext ? `.${ext}` : undefined
}

interface Submission {
  file: File
  course: CourseListingItem
  fileName: string
}

interface SubmitFormProps {
  courses: CourseListingItem[]
  coursesLoading: boolean
  selectedFile: File | undefined
  onFileSelected: (file: File | undefined) => void
  selectedCourse: CourseListingItem | undefined
  onCourseSelected: (course: CourseListingItem | undefined) => void
  fileName: string
  onFileNameChange: (fileName: string) => void
  onSubmit: (submission: Submission) => void
  onCancel: () => void
}

const SubmitForm: FunctionComponent<SubmitFormProps> = ({
  courses,
  coursesLoading,
  onSubmit,
  onCancel,
  selectedFile,
  selectedCourse,
  fileName,
  onFileSelected,
  onCourseSelected,
  onFileNameChange
}) => {
  const handleFileSelected = useCallback(
    (file: File | undefined) => {
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const handleCourseChange = useCallback(
    (value: CourseListingItem | undefined) => {
      onCourseSelected(value)
    },
    [onCourseSelected]
  )

  const handleFileNameChange = useCallback(
    (name: string) => {
      onFileNameChange(name)
    },
    [onFileNameChange]
  )

  const handleSubmit = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      if (!selectedFile || !selectedCourse || !fileName) {
        return
      }

      onSubmit({
        file: selectedFile,
        course: selectedCourse,
        fileName
      })
    },
    [selectedFile, selectedCourse, fileName, onSubmit]
  )

  const handleCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
      onCancel()
    },
    [onCancel]
  )

  const submitDisabled = !selectedFile || !selectedCourse || !fileName

  return (
    <div className="submit-form">
      <div className="submit-form__form">
        <ControlGroup>
          <ControlGroup.Head title="File" />
          <ControlGroup.Body>
            <FileSelection
              selectedFile={selectedFile}
              onFileSelected={handleFileSelected}
            />
          </ControlGroup.Body>
        </ControlGroup>

        <ControlGroup>
          <ControlGroup.Head title="Course" />
          <ControlGroup.Body>
            <CourseSelection
              selectedCourse={selectedCourse}
              isLoading={coursesLoading}
              courses={courses}
              onCourseSelected={handleCourseChange}
            />
          </ControlGroup.Body>
        </ControlGroup>

        <ControlGroup>
          <ControlGroup.Head title="Filename" />
          <ControlGroup.Body>
            <FileNamePicker
              value={fileName}
              onChange={handleFileNameChange}
              courseName={selectedCourse && selectedCourse.name}
              fileExtension={
                selectedFile && extractExtension(selectedFile.name)
              }
            />
          </ControlGroup.Body>
        </ControlGroup>
      </div>

      <div className="submit-form__submit-controls">
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button
          disabled={submitDisabled}
          variant="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  )
}

const HTTP_CREATED = 201

interface SubmitPageProps {
  history: History
}

const SubmitPage: FunctionComponent<SubmitPageProps> = ({ history }) => {
  const [areCoursesLoading, courses] = useFetchable(fetchCourses, [], [])
  const [file, setFile] = useState<File | undefined>()
  const [course, setCourse] = useState<CourseListingItem | undefined>()
  const [fileName, setFileName] = useState<string>('')

  const handleSubmit = useCallback(
    async ({ course, file, fileName }: Submission) => {
      const formData = new FormData()
      formData.append('fileName', fileName)
      formData.append('exam', file)

      const res = await fetch(`/api/courses/${course.id}/exams`, {
        body: formData,
        method: 'POST'
      })

      if (res.status === HTTP_CREATED) {
        const exam: Document = await res.json()
        history.push(`/courses/${exam.courseId}`)
      }
    },
    [history]
  )

  const handleCancel = useCallback(() => {
    history.goBack()
  }, [history])

  return (
    <>
      <ListingNavigation
        title="Submit new document"
        backButtonHref="/courses"
      />
      <main className="submit-page">
        <SubmitForm
          courses={courses}
          coursesLoading={areCoursesLoading}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          selectedFile={file}
          onFileSelected={setFile}
          selectedCourse={course}
          onCourseSelected={setCourse}
          fileName={fileName}
          onFileNameChange={setFileName}
        />
      </main>
    </>
  )
}

export default SubmitPage
