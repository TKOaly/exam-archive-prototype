import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import CourseListPage from './courses'
import DocumentListPage from './exams'
import ShrinkingHeader from './common/ShrinkingHeader'
import ListingNavigation from './common/ListingNavigation'
import NotFound from './common/NotFound'
import './App.scss'

const CourseListingNavigation: React.SFC = () => {
  return (
    <Switch>
      <Route exact path="/courses">
        <ListingNavigation
          className="app__listing-navigation"
          title="Courses"
        />
      </Route>
      <Route exact path="/courses/:id([0-9]+)-:courseSlug">
        {({ match }) => (
          <ListingNavigation
            className="app__listing-navigation"
            title={match!.params.courseSlug}
            backButtonHref="/courses"
          />
        )}
      </Route>
    </Switch>
  )
}

const App: React.SFC = () => (
  <Router>
    <div className="app">
      <div className="app__header-spacing" />
      <ShrinkingHeader className="app__header" />
      <CourseListingNavigation />
      <main className="app__content">
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/courses" />} />
          <Route exact path="/courses" component={CourseListPage} />
          <Route
            exact
            path="/courses/:id([0-9]+)-:courseSlug"
            render={({ match, history }) => (
              <DocumentListPage
                courseId={match!.params.id}
                courseSlug={match!.params.courseSlug}
                history={history}
              />
            )}
          />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  </Router>
)

export default App
