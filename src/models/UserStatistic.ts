import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { prop } from '@typegoose/typegoose'

class StatisticTimeStamps extends TimeStamps {
  constructor() {
    super()
    this.createdAt = new Date()
    this.updatedAt = new Date()
  }
}

const initStatistic = <ConvertStatistic>{
  duration: 0,
  count_total: 0,
  count_personal: 0,
  count_group: 0,
}

export const initUserStatistic = <UserStatistic>{
  voice: initStatistic,
  video_note: initStatistic,
}

export class ConvertStatistic {
  @prop({ required: true, default: 0 })
  public duration!: number
  @prop({ required: true, default: 0 })
  public count_total!: number
  @prop({ required: true, default: 0 })
  public count_personal!: number
  @prop({ required: true, default: 0 })
  public count_group!: number
}

export class UserStatistic {
  @prop({ required: true, default: initStatistic })
  public voice!: ConvertStatistic
  @prop({ required: true, default: initStatistic })
  public video_note!: ConvertStatistic
  @prop({ required: true, default: new StatisticTimeStamps() })
  public timeStamps!: StatisticTimeStamps
  touch() {
    this.timeStamps.updatedAt = new Date()
  }
}
