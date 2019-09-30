import React, { FunctionComponent, useCallback } from 'react'
import cls from 'classnames'
import ReactDatePicker, { DatePickerProps } from 'react-date-picker'
import { WithClassName } from '../common/WithClassName'
import './DatePicker.scss'

interface Props extends WithClassName {
  value: Date | undefined
  onChange: (date: Date) => void
  disabled?: boolean
}

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
      value={value}
      onChange={handleChange}
      format="y-MM-dd"
      returnValue="start"
    />
  )
}

export default DatePicker
