declare module '@ioc:Verful/Permissions/Mixins' {
  import {
    HasPermissionsMixinFactory,
    HasRolesMixinFactory,
    AuthorizableMixinFactory,
  } from '@ioc:Verful/Permissions'

  const Authorizable: AuthorizableMixinFactory
  const HasRoles: HasRolesMixinFactory
  const HasPermissions: HasPermissionsMixinFactory

  export { Authorizable, HasPermissions, HasRoles }
}
