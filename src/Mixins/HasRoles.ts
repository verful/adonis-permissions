import type { ManyToMany, ManyToManyDecorator, ColumnDecorator } from '@ioc:Adonis/Lucid/Orm'
import type {
  HasRolesMixinFactory,
  HasRolesModel as HasRolesModelContract,
  RoleContract,
  RoleModelContract,
} from '@ioc:Verful/Permissions'

const Role = global[Symbol.for('ioc.use')]('Verful/Permissions/Role') as RoleModelContract
const { manyToMany, column } = global[Symbol.for('ioc.use')]('Adonis/Lucid/Orm') as {
  manyToMany: ManyToManyDecorator
  column: ColumnDecorator
}

const HasRoles: HasRolesMixinFactory = (tableName) => {
  return (superclass) => {
    class HasRolesModel extends superclass implements HasRolesModelContract {
      @column()
      public id: number

      @manyToMany(() => Role, {
        pivotTable: tableName,
        pivotForeignKey: 'model_id',
        pivotRelatedForeignKey: 'role_id',
      })
      public roles: ManyToMany<RoleModelContract>

      public async assignRole(
        this: HasRolesModelContract,
        ...roles: Array<RoleContract | string>
      ): Promise<void> {
        const roleModels = await Promise.all(
          roles.map(async (r) =>
            typeof r === 'string' ? await Role.firstOrCreate({ name: r }) : r
          )
        )

        await this.related('roles').attach(roleModels.map((r) => r.id))
      }

      public async syncRoles(
        this: HasRolesModelContract,
        ...roles: Array<RoleContract | string>
      ): Promise<void> {
        const roleModels = await Promise.all(
          roles.map(async (r) =>
            typeof r === 'string' ? await Role.firstOrCreate({ name: r }) : r
          )
        )

        await this.related('roles').sync(roleModels.map((r) => r.id))
      }

      public async revokeRole(
        this: HasRolesModelContract,
        role: string | RoleContract
      ): Promise<void> {
        role = typeof role === 'string' ? await Role.firstOrCreate({ name: role }) : role

        await this.related('roles').detach([role.id])
      }

      public async hasRole(
        this: HasRolesModelContract,
        role: string | RoleContract
      ): Promise<boolean> {
        role = typeof role === 'string' ? role : role.name

        const roleModel = await this.related('roles').query().where('name', role).first()

        return Boolean(roleModel)
      }

      public async hasAnyRoles(
        this: HasRolesModelContract,
        ...roles: Array<RoleContract | string>
      ): Promise<boolean> {
        await this.load('roles')

        return roles.some(
          (r) =>
            this.roles.filter((r2) => r2.name === (typeof r === 'string' ? r : r.name)).length > 0
        )
      }

      public async hasAllRoles(
        this: HasRolesModelContract,
        ...roles: Array<RoleContract | string>
      ): Promise<boolean> {
        await this.load('roles')

        return roles.every(
          (r) =>
            this.roles.filter((r2) => r2.name === (typeof r === 'string' ? r : r.name)).length > 0
        )
      }

      public async getRoleNames(this: HasRolesModelContract): Promise<string[]> {
        await this.load('roles')

        return this.roles.map((r) => r.name)
      }
    }

    return HasRolesModel
  }
}

export default HasRoles
