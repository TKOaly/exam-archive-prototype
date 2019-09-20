import React, { FunctionComponent, useCallback } from 'react'
import Menu, {
  MenuList,
  MenuListItem,
  MenuListItemText,
  MenuListItemGraphic
} from '@material/react-menu'
import '@material/react-list/dist/list.css'
import '@material/react-menu-surface/dist/menu-surface.css'
import '@material/react-menu/dist/menu.css'

import EditIcon from '../common/EditIcon'

interface Props {
  open: boolean
  coordinates: { x: number; y: number } | undefined
  onClose: () => void
  onRename: () => void
}

type MenuAction = 'rename' | 'delete'

const menuItems: {
  action: MenuAction
  text: string
  graphic?: React.ReactElement<any>
}[] = [{ action: 'rename', text: 'Rename', graphic: <EditIcon /> }]

const CourseListMenu: FunctionComponent<Props> = ({
  open,
  coordinates,
  onClose,
  onRename
}) => {
  const handleSelected = useCallback(
    itemIndex => {
      const item = menuItems[itemIndex]
      if (item.action === 'rename') {
        onRename()
      }
    },
    [menuItems, onRename]
  )

  return (
    <Menu
      open={open}
      coordinates={coordinates}
      onClose={onClose}
      onSelected={handleSelected}
    >
      <MenuList>
        {menuItems.map(item => (
          <MenuListItem key={item.action}>
            {item.graphic && <MenuListItemGraphic graphic={item.graphic} />}
            <MenuListItemText primaryText={item.text} />
          </MenuListItem>
        ))}
      </MenuList>
    </Menu>
  )
}

export default CourseListMenu
