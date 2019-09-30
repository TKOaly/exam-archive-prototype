import React, { FunctionComponent, useCallback } from 'react'
import cls from 'classnames'
import ReactDatePicker, { DatePickerProps } from 'react-date-picker'
import { WithClassName } from '../common/WithClassName'
import './DatePicker.scss'

const CalendarIcon: FunctionComponent<WithClassName> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="19"
    height="19"
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
    <path fill="none" d="M0 0h24v24H0z" />
  </svg>
)

interface Props extends WithClassName {
  value: Date | undefined
  onChange: (date: Date) => void
  disabled?: boolean
}

const calendarIcon = <CalendarIcon className="date-picker__calendar-icon" />

const DatePicker: FunctionComponent<Props> = ({
  className,
  value,
  onChange,
  disabled
}) => {
  const handleChange = useCallback<
    Exclude<DatePickerProps['onChange'], undefined>
  >(
    date => {
      // returnValue="start" so the arg is never an array. It's only an
      // array if returnValue="range"
      onChange(date as Date)
    },
    [onChange]
  )

  return (
    <ReactDatePicker
      disabled={disabled}
      className={cls('date-picker', className)}
      calendarClassName="date-picker__calendar"
      calendarIcon={calendarIcon}
      value={value}
      onChange={handleChange}
      format="y-MM-dd"
      returnValue="start"
    />
  )
}

export default DatePicker
