import React from 'react'
import { headerHeight, headerHeightShrunk } from '../common'
import Header, { Props as HeaderProps } from './Header'

export type Props = Pick<HeaderProps, Exclude<keyof HeaderProps, 'isShrunk'>>

interface State {
  isShrunk: boolean
}

class ShrinkingHeader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { isShrunk: false }
    this.handleScroll = this.handleScroll.bind(this)
  }

  handleScroll() {
    const y = window.pageYOffset
    const headerShouldBeShrunk = y > headerHeight - headerHeightShrunk

    const headerShouldBeButIsNotShrunk =
      headerShouldBeShrunk && !this.state.isShrunk
    const headerShouldNotButIsShrunk =
      !headerShouldBeShrunk && this.state.isShrunk

    if (headerShouldBeButIsNotShrunk || headerShouldNotButIsShrunk) {
      this.setState({ isShrunk: headerShouldBeShrunk })
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }

  render() {
    return <Header {...this.props} isShrunk={this.state.isShrunk} />
  }
}

export default ShrinkingHeader
