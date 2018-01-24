import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import DummyCourseList from '../containers/DummyCourseList'
import ShrinkingHeader from './ShrinkingHeader'
import ListingNavigation from './ListingNavigation'
import NotFound from './NotFound'
import './App.css'

const CourseListingNavigation = () => {
  return (
    <Switch>
      <Route exact path="/courses">
        <ListingNavigation
          className="app__listing-navigation"
          title="Courses"
        />
      </Route>
      <Route exact path="/courses/:courseName">
        {({ match }) => (
          <ListingNavigation
            className="app__listing-navigation"
            title={match.params.courseName}
            backButtonHref="/courses"
          />
        )}
      </Route>
    </Switch>
  )
}

const App = () => (
  <Router>
    <div className="app">
      <div className="app__header-spacing" />
      <ShrinkingHeader className="app__header" />
      <CourseListingNavigation />
      <main className="app__content">
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/courses" />} />
          <Route path="/courses" component={DummyCourseList} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  </Router>
)

export default App
