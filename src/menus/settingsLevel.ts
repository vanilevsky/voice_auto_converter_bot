import { AvailableLevels, LevelsCodes } from '@/models/UserSettings'
import { Menu } from '@grammyjs/menu'
import Context from '@/models/Context'

const settingsLevelMenu = new Menu<Context>('settings-level')

export const settingLevelSelectedMessage = (ctx: Context) => {
  const levelCode = ctx.dbuser.settings.level
  const levelTitle =
    AvailableLevels.find((level) => level.code === levelCode)?.title ||
    'level_unknown'

  return ctx.editMessageText(
    ctx.i18n.t('settings_level_selected') + ': ' + ctx.i18n.t(levelTitle)
  )
}

const useSettingLevel = (levelCode: LevelsCodes) => async (ctx: Context) => {
  ctx.dbuser.settings.level = levelCode
  await ctx.dbuser.save()
  return settingLevelSelectedMessage(ctx)
}

AvailableLevels.forEach((level, index) => {
  // ToDo Переводить текст кнопок
  settingsLevelMenu.text(level.title, useSettingLevel(level.code))
  if (index % 2 != 0) {
    settingsLevelMenu.row()
  }
})
settingsLevelMenu.back('←', (ctx) =>
  ctx.editMessageText(ctx.i18n.t('settings'))
)

export default settingsLevelMenu
