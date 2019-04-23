import React from 'react'
import ReactSelect from 'react-select'
import { ChipSet, Chip } from '@material/react-chips'
import '@material/react-chips/dist/chips.css'
import { ValueType, ActionMeta } from 'react-select/lib/types'
import { CourseListingItem } from '../../domain'
import CloseIcon from './CloseIcon'
import './CourseSelection.scss'

interface ReactSelectOption {
  label: string
  value: string
}

interface CourseSelectOption extends ReactSelectOption {
  course: CourseListingItem
}

type OptionType = CourseSelectOption

const toSelectOption = (course: CourseListingItem): OptionType => ({
  label: course.name,
  value: `${course.id}`,
  course: course
})

const byLabel = (a: OptionType, b: OptionType) => a.label.localeCompare(b.label)

interface CourseSelectProps {
  isLoading: boolean
  courses: CourseListingItem[]
  onCourseSelected: (course: CourseListingItem) => void
}

/**
 * Unidirectional wrapper over a ReactSelect. This wrapper forces the Select to
 * not preserve any value, so that it can be used as a "search and choose" after
 * which the component is swapped out for a Chip by CourseSelection.
 */
const CourseSelect = ({
  isLoading,
  courses,
  onCourseSelected
}: CourseSelectProps) => {
  const handleChange = (value: ValueType<OptionType>, action: ActionMeta) => {
    if (action.action === 'select-option') {
      onCourseSelected((value as OptionType).course)
    }
  }

  const options = courses.map(toSelectOption).sort(byLabel)

  return (
    <ReactSelect<OptionType>
      className="course-select"
      classNamePrefix="course-select"
      placeholder="Choose a course..."
      value={undefined /* Force out-only data flow */}
      onChange={handleChange}
      theme={theme => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#ffcc33',
          primary25: '#D8D8D8'
        }
      })}
      {...{ isLoading, options }}
    />
  )
}

interface CourseSelectionProps {
  isLoading: boolean
  courses: CourseListingItem[]
  selectedCourse: CourseListingItem | undefined
  onCourseSelected: (course: CourseListingItem | undefined) => void
}

const CourseSelection = ({
  isLoading,
  courses,
  selectedCourse,
  onCourseSelected
}: CourseSelectionProps) => {
  return selectedCourse ? (
    <ChipSet choice handleSelect={() => onCourseSelected(undefined)}>
      <Chip
        id={`${selectedCourse.id}`}
        label={selectedCourse.name}
        trailingIcon={<CloseIcon />}
      />
    </ChipSet>
  ) : (
    <CourseSelect
      isLoading={isLoading}
      courses={courses}
      onCourseSelected={onCourseSelected}
    />
  )
}

export default CourseSelection
