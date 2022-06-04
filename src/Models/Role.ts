import type { DateTime } from 'luxon'
import type { ConfigContract } from '@ioc:Adonis/Core/Config'
import type {
  HasPermissionsMixinFactory,
  RoleContract,
  RoleModelContract,
} from '@ioc:Verful/Permissions'
import type { ColumnDecorator, DateTimeColumnDecorator, LucidModel } from '@ioc:Adonis/Lucid/Orm'

const { BaseModel, column } = global[Symbol.for('ioc.use')]('Adonis/Lucid/Orm') as {
  BaseModel: LucidModel
  column: ColumnDecorator & {
    dateTime: DateTimeColumnDecorator
  }
}

export default function createRoleModel(
  config: ConfigContract,
  hasPermissionsFactory: HasPermissionsMixinFactory
): RoleModelContract {
  const pivotTable = config.get('permissions.tableNames.roleHasPermissions')
  const HasPermissions = hasPermissionsFactory(pivotTable)
  class Role extends HasPermissions(BaseModel) implements RoleContract {
    public static table = config.get('permissions.tableNames.roles')

    @column({ isPrimary: true })
    public id: number

    @column()
    public name: string

    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt: DateTime
  }

  return Role
}
