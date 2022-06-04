declare module '@ioc:Verful/Permissions' {
  import { NormalizeConstructor } from '@ioc:Adonis/Core/Helpers'
  import { LucidModel, LucidRow, ManyToMany } from '@ioc:Adonis/Lucid/Orm'

  export interface PermissionModelContract extends Omit<LucidModel, 'constructor'> {
    new (): PermissionContract
  }

  export interface PermissionContract extends LucidRow {
    id: any
    name: string
  }

  export interface HasPermissionsModel extends LucidRow {
    permissions: ManyToMany<PermissionModelContract>
    hasPermissionTo(permission: PermissionContract | string): Promise<boolean>
    checkPermissionTo(permission: PermissionContract | string): Promise<boolean>
    hasAnyPermission(...permissions: Array<PermissionContract | string>): Promise<boolean>
    hasAllPermissions(...permissions: Array<PermissionContract | string>): Promise<boolean>
    givePermissionTo(...permissions: Array<PermissionContract | string>): Promise<void>
    syncPermissions(...permissions: Array<PermissionContract | string>): Promise<void>
    revokePermissionTo(permission: PermissionContract | string): Promise<void>
    getPermissionNames(): Promise<string[]>
  }

  export interface HasPermissionsMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & HasPermissionsModel
    }
  }

  export interface RoleModelContract extends Omit<LucidModel, 'constructor'> {
    new (): RoleContract
  }

  export interface RoleContract extends HasPermissionsModel {
    id: any
    name: string
  }

  export interface HasRolesModel extends LucidRow {
    roles: ManyToMany<RoleModelContract>
    assignRole(...roles: Array<RoleContract | string>): Promise<void>
    syncRoles(...roles: Array<RoleContract | string>): Promise<void>
    revokeRole(role: RoleContract | string): Promise<void>
    hasRole(role: RoleContract | string): Promise<boolean>
    hasAnyRoles(...roles: Array<RoleContract | string>): Promise<boolean>
    hasAllRoles(...roles: Array<RoleContract | string>): Promise<boolean>
    getRoleNames(): Promise<string[]>
  }

  export interface HasRolesMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & HasRolesModel
    }
  }

  export interface HasRolesMixinFactory {}

  export interface AuthorizableModel extends HasRolesModel, HasPermissionsModel {
    hasDirectPermission(permission: PermissionContract | string): Promise<boolean>
    hasPermissionViaRole(permission: PermissionContract | string): Promise<boolean>
    getDirectPermissions(): Promise<PermissionContract[]>
    getPermissionsViaRoles(): Promise<PermissionContract[]>
    getAllPermissions(): Promise<PermissionContract[]>
  }

  export interface AuthorizableMixin {
    <T extends NormalizeConstructor<LucidModel>>(superclass: T): T & {
      new (...args: any[]): LucidRow & AuthorizableModel
    }
  }

  export interface HasPermissionsMixinFactory {
    (pivotTable: string): HasPermissionsMixin
  }

  export interface HasRolesMixinFactory {
    (pivotTable: string): HasRolesMixin
  }

  export interface AuthorizableMixinFactory {
    (config: AuthorizableConfig): AuthorizableMixin
  }

  export interface AuthorizableConfig {
    permissionsPivotTable: string
    rolesPivotTable: string
  }

  export interface PermissionsConfigContract {
    tableNames: {
      permissions: string
      roles: string
      roleHasPermissions: string
    }
  }
}
