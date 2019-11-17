import React, {
  useState,
  useEffect,
  useCallback,
  FunctionComponent
} from 'react'
import cls from 'classnames'
import formatDate from 'date-fns/format'
import TextField, { Input as TextFieldInput } from '@material/react-text-field'
import MDCSwitch from '@material/react-switch'
import '@material/react-text-field/dist/text-field.css'
import '@material/react-switch/dist/switch.css'

import { generateCourseFilename } from '../common/slug'
import { WithClassName } from '../common/WithClassName'
import { ControlTitle } from './FormControls'
import DatePicker from './DatePicker'
import './FileNamePicker.scss'

interface SwitchProps extends WithClassName {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  htmlId: string
}

const MySwitch: FunctionComponent<SwitchProps> = ({
  checked,
  onChange,
  label,
  htmlId,
  className
}) => {
  const handleChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      // .currentTarget only returns the MDC control's base
      onChange((e.target as any).checked)
    },
    [onChange]
  )

  return (
    <div className={cls('my-switch', className)}>
      <MDCSwitch
        nativeControlId={htmlId}
        checked={checked}
        onChange={handleChange}
      />
      <label className="my-switch__label" htmlFor={htmlId}>
        {label}
      </label>
    </div>
  )
}

interface Props {
  courseName?: string
  fileExtension?: string
  value: string
  onChange: (name: string) => void
}

const FileNamePicker: FunctionComponent<Props> = ({
  value,
  onChange,
  courseName,
  fileExtension
}) => {
  const [usingCustomFilename, setUsingCustomFilename] = useState<boolean>(false)
  const [examDate, setExamDate] = useState<Date>(new Date())
  const [examType, setExamType] = useState<string>('')

  const handleCustomFilenameSwitchChange = useCallback(
    (checked: boolean) => setUsingCustomFilename(checked),
    [setUsingCustomFilename]
  )

  const handleCustomFilenameChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault()
      if (!usingCustomFilename) {
        return
      }

      onChange(e.currentTarget.value)
    },
    [usingCustomFilename, onChange]
  )

  const handleFileNameMouseDown = useCallback(() => {
    setUsingCustomFilename(true)
  }, [setUsingCustomFilename])

  const handleExamDateChange = useCallback(
    (date: Date) => {
      setExamDate(date)
    },
    [setExamDate]
  )

  const handleExamTypeChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      e.preventDefault()
      setExamType(e.currentTarget.value)
    },
    [setExamType]
  )

  useEffect(() => {
    // generate filename when specs change, unless user has specified usingCustomFilename
    // in the case of which the handler calls onChange directly
    if (!usingCustomFilename) {
      const filename = [
        formatDate(examDate, 'YYMMDD'),
        courseName && generateCourseFilename(courseName),
        examType
      ]
        .filter(Boolean)
        .join('_')

      const ext = fileExtension || ''

      onChange(`${filename}${ext}`)
    }
  }, [
    usingCustomFilename,
    courseName,
    examDate,
    examType,
    fileExtension,
    onChange
  ])

  return (
    <div className="file-name-picker">
      <MySwitch
        checked={usingCustomFilename}
        htmlId="file-name-picker__custom-fname"
        label="Specify filename manually"
        onChange={handleCustomFilenameSwitchChange}
        className="file-name-picker__switch"
      />
      <div
        className={cls('file-name-picker__generator', {
          'file-name-picker__generator--disabled': usingCustomFilename
        })}
      >
        <div className="file-name-picker__generator-section">
          <ControlTitle className="file-name-picker__generator-title">
            Exam date
          </ControlTitle>
          <DatePicker
            className="file-name-picker__exam-date"
            disabled={usingCustomFilename}
            value={examDate}
            onChange={handleExamDateChange}
          />
        </div>
        <div className="file-name-picker__generator-section">
          <ControlTitle className="file-name-picker__generator-title">
            Exam type (KK/EK/VK/...)
          </ControlTitle>
          <TextField
            dense
            outlined
            className="file-name-picker__text file-name-picker__exam-type"
          >
            <TextFieldInput
              disabled={usingCustomFilename}
              style={{ paddingTop: '7px' }}
              className="file-name-picker__text-input file-name-picker__exam-type-input"
              onChange={handleExamTypeChange}
              value={examType}
            />
          </TextField>
        </div>
      </div>
      <TextField
        dense
        outlined
        className="file-name-picker__text file-name-picker__file-name"
        // use onMouseDown instead of onClick because it's onClick does not fire when it's disabled
        onMouseDown={handleFileNameMouseDown}
      >
        <TextFieldInput
          disabled={!usingCustomFilename}
          style={{ paddingTop: '7px' }}
          className="file-name-picker__text-input file-name-picker__file-name-input"
          onChange={handleCustomFilenameChange}
          value={value}
        />
      </TextField>
    </div>
  )
}

export default FileNamePicker
