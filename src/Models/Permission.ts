import type { DateTime } from 'luxon'
import type { PermissionContract, PermissionModelContract } from '@ioc:Verful/Permissions'
import type { ConfigContract } from '@ioc:Adonis/Core/Config'
import type { ColumnDecorator, DateTimeColumnDecorator, LucidModel } from '@ioc:Adonis/Lucid/Orm'

const { BaseModel, column } = global[Symbol.for('ioc.use')]('Adonis/Lucid/Orm') as {
  BaseModel: LucidModel
  column: ColumnDecorator & {
    dateTime: DateTimeColumnDecorator
  }
}

export default function createPermissionModel(config: ConfigContract): PermissionModelContract {
  class Permission extends BaseModel implements PermissionContract {
    public static table = config.get('permissions.tableNames.permissions')

    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
  }

  return Permission
}
