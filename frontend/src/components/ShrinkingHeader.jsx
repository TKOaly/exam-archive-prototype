import React from 'react'
import { headerHeight, headerHeightShrunk } from '../common'
import Header from './Header'

class ShrinkingHeader extends React.Component {
  constructor(props) {
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
    return <Header isShrunk={this.state.isShrunk} {...this.props} />
  }
}

export default ShrinkingHeader
