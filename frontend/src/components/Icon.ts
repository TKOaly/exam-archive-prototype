import React, { FunctionComponent } from 'react'
import { WithClassName } from './WithClassName'

interface IconProps extends WithClassName {
  alt?: string
}

export type Icon = FunctionComponent<IconProps>
