declare module '@ioc:Adonis/Core/Application' {
  import {
    HasRolesMixinFactory,
    AuthorizableMixinFactory,
    HasPermissionsMixinFactory,
    PermissionModelContract,
    RoleModelContract,
  } from '@ioc:Verful/Permissions'

  export interface ContainerBindings {
    'Verful/Permissions/Permission': PermissionModelContract
    'Verful/Permissions/Role': RoleModelContract
    'Verful/Permissions/Mixins': {
      Authorizable: AuthorizableMixinFactory
      HasRoles: HasRolesMixinFactory
      HasPermissions: HasPermissionsMixinFactory
    }
  }
}
