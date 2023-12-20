import { UserSettings } from '@/models/UserSettings'
import { UserStatistic } from '@/models/UserStatistic'
import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class User {
  @prop({ required: true, index: true, unique: true })
  id!: number
  @prop({ required: true, default: 'ru' })
  language!: string
  @prop({ required: true, default: UserStatistic.getDefault() })
  statistic!: UserStatistic
  @prop({ required: true, default: UserSettings.getDefault() })
  settings!: UserSettings
  @prop()
  createdAt!: Date
}

const UserModel = getModelForClass(User)

export function findOrCreateUser(id: number) {
  return UserModel.findOneAndUpdate(
    { id },
    {},
    {
      upsert: true,
      new: true,
    }
  )
}
