import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class PermissionsProvider {
  constructor(protected app: ApplicationContract) {}
  public static needsApplication = true

  public register() {
    this.app.container.singleton('Verful/Permissions/Permission', () => {
      const permissionModelFactory = require('../src/Models/Permission').default
      return permissionModelFactory(this.app.config)
    })
    this.app.container.singleton('Verful/Permissions/Role', () => {
      const roleModelFactory = require('../src/Models/Role').default
      const hasPermissionsMixinFactory = require('../src/Mixins/HasPermissions').default
      return roleModelFactory(this.app.config, hasPermissionsMixinFactory)
    })
    this.app.container.singleton('Verful/Permissions/Mixins', () => ({
      Authorizable: require('../src/Mixins/Authorizable').default,
      HasRoles: require('../src/Mixins/HasRoles').default,
      HasPermissions: require('../src/Mixins/HasPermissions').default,
    }))
  }
}
