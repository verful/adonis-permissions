import type {
  ColumnDecorator,
  LucidModel,
  ManyToMany,
  ManyToManyDecorator,
} from '@ioc:Adonis/Lucid/Orm'
import type {
  HasPermissionsMixinFactory,
  HasPermissionsModel as HasPermissionsModelContract,
  PermissionContract,
  PermissionModelContract,
} from '@ioc:Verful/Permissions'

const Permission = global[Symbol.for('ioc.use')](
  'Verful/Permissions/Permission'
) as PermissionModelContract

const { manyToMany, column } = global[Symbol.for('ioc.use')]('Adonis/Lucid/Orm') as {
  manyToMany: ManyToManyDecorator
  column: ColumnDecorator
}

const HasPermissions: HasPermissionsMixinFactory = (tableName) => {
  return (superclass) => {
    class HasPermissionsModel extends superclass implements HasPermissionsModelContract {
      @manyToMany(() => Permission, {
        pivotTable: tableName,
        pivotForeignKey: 'model_id',
        pivotRelatedForeignKey: 'permission_id',
      })
      public permissions: ManyToMany<PermissionModelContract, LucidModel>

      @column({ isPrimary: true })
      public id: number

      public async hasPermissionTo(
        this: HasPermissionsModelContract,
        permission: string | PermissionContract
      ): Promise<boolean> {
        permission = typeof permission === 'string' ? permission : permission.name

        const model = await this.related('permissions').query().where('name', permission).first()

        return Boolean(model)
      }

      public async checkPermissionTo(permission: string | PermissionContract): Promise<boolean> {
        if (await this.hasPermissionTo(permission)) {
          return true
        }

        throw new Error(`User does not have permission to ${permission}`)
      }

      public async hasAnyPermission(
        this: HasPermissionsModelContract,
        ...permissions: Array<PermissionContract | string>
      ): Promise<boolean> {
        await this.load('permissions')

        for (const permission of permissions) {
          if (await this.hasPermissionTo(permission)) {
            return true
          }
        }

        return false
      }

      public async hasAllPermissions(
        this: HasPermissionsModelContract,
        ...permissions: Array<PermissionContract | string>
      ): Promise<boolean> {
        await this.load('permissions')

        for (const permission of permissions) {
          if (!(await this.hasPermissionTo(permission))) {
            return false
          }
        }

        return true
      }

      public async givePermissionTo(
        this: HasPermissionsModelContract,
        ...permissions: Array<PermissionContract | string>
      ): Promise<void> {
        for (let permission of permissions) {
          permission =
            typeof permission === 'string'
              ? await Permission.firstOrCreate({ name: permission })
              : permission

          await this.related('permissions').attach([permission.id])
        }
      }

      public async syncPermissions(
        this: HasPermissionsModelContract,
        ...permissions: Array<PermissionContract | string>
      ): Promise<void> {
        const permissionModels = await Promise.all(
          permissions.map((p) =>
            typeof p === 'string' ? Permission.firstOrCreate({ name: p }) : p
          )
        )

        await this.related('permissions').sync(permissionModels.map((p) => p.id))
      }

      public async revokePermissionTo(
        this: HasPermissionsModelContract,
        permission: string | PermissionContract
      ): Promise<void> {
        permission =
          typeof permission === 'string'
            ? await Permission.firstOrCreate({ name: permission })
            : permission

        await this.related('permissions').detach([permission.id])
      }

      public async getPermissionNames(this: HasPermissionsModelContract): Promise<string[]> {
        const permissions = await this.related('permissions').query().select('name')

        return permissions.map((p) => p.name)
      }
    }

    return HasPermissionsModel
  }
}

export default HasPermissions
