import React, {
  FunctionComponent,
  useState,
  useEffect,
  useCallback
} from 'react'
import TextField, { Input as TextFieldInput } from '@material/react-text-field'
import '@material/react-text-field/dist/text-field.css'
import { History } from 'history'
import cz from 'classnames'

import { CourseListingItem, Document } from '../../domain'
import ListingNavigation from '../common/ListingNavigation'
import CourseSelection from './CourseSelection'
import FileSelection from './FileSelection'
import { ControlGroup, ControlTitle } from './FormControls'
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

const Button: FunctionComponent<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > & { variant?: 'primary' | 'secondary' }
> = ({ variant = 'primary', ...buttonProps }) => {
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
  const handleFileSelected = (file: File | undefined) => {
    onFileSelected(file)

    if (file && fileName === '') {
      onFileNameChange(file.name)
    }
  }

  const handleCourseChange = (value: CourseListingItem | undefined) => {
    onCourseSelected(value)
  }

  const handleFileNameChange = (e: any) => {
    onFileNameChange(e.currentTarget.value)
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    if (!selectedFile || !selectedCourse || !fileName) {
      return
    }

    onSubmit({
      file: selectedFile,
      course: selectedCourse,
      fileName
    })
  }

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
          <ControlGroup.Head title="File name" />
          <ControlGroup.Body>
            <TextField dense outlined className="submit-form__file-name">
              <TextFieldInput
                style={{ paddingTop: '7px' }}
                className="submit-form__file-name-input"
                onChange={handleFileNameChange}
                value={fileName}
              />
            </TextField>
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

  const handleSubmit = async ({ course, file, fileName }: Submission) => {
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
  }

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
