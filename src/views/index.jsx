const React = require('react')

const Layout = require('./common/Layout')
const Footer = require('./common/Footer')
const ListingNavigation = require('./common/ListingNavigation')
const CourseList = require('./common/CourseList')
const { ControlsBox, Logout } = require('./common/Controls')

const CreateCourseForm = () => {
  return (
    <form className="create-course-form" method="post">
      <h3>Add a new course:</h3>
      <input
        className="create-course-form__name"
        required
        aria-label="Course name"
        placeholder="Course name"
        type="text"
        name="courseName"
      ></input>
      <input
        className="create-course-form__submit"
        type="submit"
        name="create"
        value="Create course"
      />
    </form>
  )
}

const IndexPage = ({ flash, courses, username, userRights }) => {
  return (
    <Layout flash={flash}>
      <ListingNavigation title="Courses" />
      <div className="page-container">
        <main>
          <CourseList
            courses={courses}
            showDelete={userRights.remove}
            showRename={userRights.rename}
          />
          <ControlsBox>
            {userRights.upload && <CreateCourseForm />}
            <Logout username={username} />
          </ControlsBox>
        </main>
        <Footer />
      </div>
    </Layout>
  )
}

module.exports = IndexPage
