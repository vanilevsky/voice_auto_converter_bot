import { Menu } from '@grammyjs/menu'
import { cwd } from 'process'
import { load } from 'js-yaml'
import { readFileSync, readdirSync } from 'fs'
import { resolve } from 'path'
import Context from '@/models/Context'
import * as console from "console";

interface YamlWithName {
  name: string
}

const localeFilePaths = readdirSync(resolve(cwd(), 'locales'))

const localeFile = (path: string) => {
  return load(
    readFileSync(resolve(cwd(), 'locales', path), 'utf8')
  ) as YamlWithName
}

const setLanguage = (languageCode: string) => async (ctx: Context) => {
  ctx.dbuser.language = languageCode


  console.log('await ctx.dbuser.save()', languageCode)

  const res = await ctx.dbuser.save()

  console.log(res)

  ctx.i18n.locale(languageCode)
  return ctx.editMessageText(ctx.i18n.t('language_selected'), {
    parse_mode: 'HTML',
    reply_markup: undefined,
  })
}

const languageMenu = new Menu<Context>('language')

localeFilePaths.forEach((localeFilePath, index) => {

  console.log(localeFilePath, index)

  const localeCode = localeFilePath.split('.')[0]
  const localeName = localeFile(localeFilePath).name
  languageMenu.text(localeName, setLanguage(localeCode))
  if (index % 2 != 0) {
    languageMenu.row()
  }
})

export default languageMenu
