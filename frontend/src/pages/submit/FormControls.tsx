import React, { FunctionComponent } from 'react'
import cls from 'classnames'
import { WithClassName } from '../common/WithClassName'
import './FormControls.scss'

const ControlGroupHead: FunctionComponent<{ title: string }> = ({ title }) => (
  <div className="control-group__head">
    <p className="control-group__head-title">{title}</p>
  </div>
)

const ControlGroupBody: FunctionComponent = ({ children }) => (
  <div className="control-group__body">{children}</div>
)

interface ControlGroupType<P = {}> extends FunctionComponent<P> {
  Head: typeof ControlGroupHead
  Body: typeof ControlGroupBody
}

export const ControlGroup: ControlGroupType<WithClassName> = ({
  className,
  children
}) => <div className={cls('control-group', className)}>{children}</div>

ControlGroup.Head = ControlGroupHead
ControlGroup.Body = ControlGroupBody

export const ControlTitle: FunctionComponent<WithClassName> = ({
  children,
  className
}) => <p className={cls('control-title', className)}>{children}</p>
