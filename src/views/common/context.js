const React = require('react')
const { useContext } = React

const UserContext = React.createContext({
  username: '',
  canRename: false,
  canDelete: false
})

const UserContextProvider = ({ children, username, canRename, canDelete }) => (
  <UserContext.Provider value={{ username, canRename, canDelete }}>
    {children}
  </UserContext.Provider>
)
const useUserContext = () => useContext(UserContext)

module.exports = { UserContextProvider, useUserContext }
