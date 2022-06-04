import type {
  AuthorizableMixinFactory,
  AuthorizableModel as AuthorizableModelContract,
  PermissionContract,
} from '@ioc:Verful/Permissions'

import HasRoles from './HasRoles'
import HasPermissions from './HasPermissions'

const Authorizable: AuthorizableMixinFactory = (config) => {
  const { rolesPivotTable, permissionsPivotTable } = config
  const HasPermissionsMixin = HasPermissions(permissionsPivotTable)
  const HasRolesMixin = HasRoles(rolesPivotTable)
  return (superclass) => {
    class AuthorizableModel
      extends HasRolesMixin(HasPermissionsMixin(superclass))
      implements AuthorizableModelContract
    {
      public async hasDirectPermission(
        this: AuthorizableModelContract,
        permission: string | PermissionContract
      ): Promise<boolean> {
        permission = typeof permission === 'string' ? permission : permission.name

        const model = await this.related('permissions').query().where('name', permission).first()

        return Boolean(model)
      }

      public async hasPermissionViaRole(
        this: AuthorizableModelContract,
        permission: string | PermissionContract
      ): Promise<boolean> {
        permission = typeof permission === 'string' ? permission : permission.name

        const roleWithPermission = await this.related('roles')
          .query()
          .whereHas('permissions', (q) => q.where('name', permission as string))
          .first()

        return Boolean(roleWithPermission)
      }

      public async getDirectPermissions(
        this: AuthorizableModelContract
      ): Promise<PermissionContract[]> {
        await this.load('permissions')

        return this.permissions
      }

      public async getPermissionsViaRoles(
        this: AuthorizableModelContract
      ): Promise<PermissionContract[]> {
        await this.load('roles', (q) => q.preload('permissions'))

        return this.roles.map((r) => r.permissions).flat()
      }

      public async getAllPermissions(
        this: AuthorizableModelContract
      ): Promise<PermissionContract[]> {
        await this.load((loader) => {
          loader.load('permissions').load('roles', (q) => q.preload('permissions'))
        })

        return [...this.permissions, ...this.roles.map((r) => r.permissions)].flat()
      }
    }

    return AuthorizableModel
  }
}

export default Authorizable
