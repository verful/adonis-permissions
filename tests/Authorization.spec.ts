import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { Authorizable } from '@ioc:Verful/Permissions/Mixins'
import Permission from '@ioc:Verful/Permissions/Permission'
import Role from '@ioc:Verful/Permissions/Role'
import { test } from '@japa/runner'
import { cleanDatabase, setupDatabase } from '../bin/test/database'

test.group('Authorizable', (group) => {
  group.each.setup(async () => {
    await setupDatabase()
    return () => cleanDatabase()
  })

  test('Mixin gets applied succesfully', ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {}

    // Has Permissions
    expect(Model.$relationsDefinitions.get('permissions')!.relationName).toBe('permissions')
    expect(Model.prototype.hasPermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.checkPermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.hasAnyPermission).toEqual(expect.any(Function))
    expect(Model.prototype.hasAllPermissions).toEqual(expect.any(Function))
    expect(Model.prototype.givePermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.syncPermissions).toEqual(expect.any(Function))
    expect(Model.prototype.revokePermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.getPermissionNames).toEqual(expect.any(Function))

    // Has Roles
    expect(Model.$relationsDefinitions.get('roles')!.relationName).toBe('roles')
    expect(Model.prototype.assignRole).toEqual(expect.any(Function))
    expect(Model.prototype.syncRoles).toEqual(expect.any(Function))
    expect(Model.prototype.revokeRole).toEqual(expect.any(Function))
    expect(Model.prototype.hasRole).toEqual(expect.any(Function))
    expect(Model.prototype.hasAnyRoles).toEqual(expect.any(Function))
    expect(Model.prototype.hasAllRoles).toEqual(expect.any(Function))
    expect(Model.prototype.getRoleNames).toEqual(expect.any(Function))

    // Authorizable
    expect(Model.prototype.hasDirectPermission).toEqual(expect.any(Function))
    expect(Model.prototype.hasPermissionViaRole).toEqual(expect.any(Function))
    expect(Model.prototype.getPermissionsViaRoles).toEqual(expect.any(Function))
    expect(Model.prototype.getAllPermissions).toEqual(expect.any(Function))
  })

  test('Pivot table names comes from mixin argument', ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {}
    // @ts-expect-error
    expect(Model.$relationsDefinitions.get('permissions')!.options.pivotTable).toBe(
      'model_has_permissions'
    )
    // @ts-expect-error
    expect(Model.$relationsDefinitions.get('roles')!.options.pivotTable).toBe('model_has_roles')
  })

  test('Can test for model direct permissions', async ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const role = await Role.create({ name: 'role-1' })
    await role.givePermissionTo('permission-2')
    await model.assignRole(role)
    const permission = await Permission.create({ name: 'permission-3' })
    expect(await model.hasDirectPermission('permission-1')).toBe(true)
    expect(await model.hasDirectPermission('permission-2')).toBe(false)
    expect(await model.hasDirectPermission(permission)).toBe(false)
  })

  test('Can test for model role permissions', async ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const role = await Role.create({ name: 'role-1' })
    await role.givePermissionTo('permission-2')
    const permission = await Permission.create({ name: 'permission-3' })
    await model.assignRole(role)
    expect(await model.hasPermissionViaRole('permission-1')).toBe(false)
    expect(await model.hasPermissionViaRole('permission-2')).toBe(true)
    expect(await model.hasPermissionViaRole(permission)).toBe(false)
  })

  test('Can get model direct permissions', async ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const role = await Role.create({ name: 'role-1' })
    await role.givePermissionTo('permission-2')
    await model.assignRole(role)
    expect((await model.getDirectPermissions()).map(({ name }) => name)).toEqual(['permission-1'])
  })

  test('Can get model permissions via roles', async ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const role = await Role.create({ name: 'role-1' })
    await role.givePermissionTo('permission-2')
    await model.assignRole(role)
    expect((await model.getPermissionsViaRoles()).map(({ name }) => name)).toEqual(
      expect.arrayContaining(['permission-2'])
    )
  })

  test('Can get all model permissions', async ({ expect }) => {
    const Mixin = Authorizable({
      rolesPivotTable: 'model_has_roles',
      permissionsPivotTable: 'model_has_permissions',
    })
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const role = await Role.create({ name: 'role-1' })
    await role.givePermissionTo('permission-2')
    await model.assignRole(role)
    expect((await model.getAllPermissions()).map(({ name }) => name)).toEqual(
      expect.arrayContaining(['permission-1', 'permission-2'])
    )
  })
})
