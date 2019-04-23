import React from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom'
import CourseListPage from './courses'
import DocumentListPage from './exams'
import SubmitPage from './submit'
import ShrinkingHeader from './common/ShrinkingHeader'
import NotFound from './common/NotFound'
import './App.scss'

const App = () => {
  return (
    <Router>
      <div className="app">
        <div className="app__header-spacing" />
        <ShrinkingHeader className="app__header" />

        <Switch>
          <Route exact path="/" render={() => <Redirect to="/courses" />} />
          <Route exact path="/courses" component={CourseListPage} />
          <Route
            exact
            path="/courses/:id([0-9]+):ignore(-?):courseSlug(.*)"
            render={({ match, history }) => (
              <DocumentListPage
                courseId={match!.params.id}
                courseSlug={match!.params.courseSlug}
                history={history}
              />
            )}
          />
          <Route exact path="/submit" component={SubmitPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  )
}

export default App
