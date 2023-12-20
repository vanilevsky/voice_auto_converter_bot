import { Menu } from '@grammyjs/menu'
import Context from '@/models/Context'
import settingsLevelMenu, {
  settingLevelSelectedMessage,
} from '@/menus/settingsLevel'

const settingsMenu = new Menu<Context>('settings')

settingsMenu.submenu('Level', 'settings-level', settingLevelSelectedMessage)
settingsMenu.register(settingsLevelMenu)

export default settingsMenu
