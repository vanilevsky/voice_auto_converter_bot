import { prop } from '@typegoose/typegoose'

type Level = {
  title: string
  code: LevelsCodes
}

export enum LevelsCodes {
  easy = 0,
  medium = 1,
  hard = 2,
}

export const AvailableLevels: Level[] = [
  {
    title: 'level_easy',
    code: LevelsCodes.easy,
  },
  {
    title: 'level_medium',
    code: LevelsCodes.medium,
  },
  {
    title: 'level_hard',
    code: LevelsCodes.hard,
  },
]

const defaultLevelCode = LevelsCodes.medium

const defaultUserSettings = <UserSettings>{
  level: defaultLevelCode,
}

export class UserSettings {
  @prop({ required: true, default: defaultLevelCode })
  public level!: LevelsCodes
  static getDefault() {
    return defaultUserSettings
  }
}
