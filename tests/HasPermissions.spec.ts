import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import Permission from '@ioc:Verful/Permissions/Permission'
import { HasPermissions } from '@ioc:Verful/Permissions/Mixins'
import { test } from '@japa/runner'
import { cleanDatabase, setupDatabase } from '../bin/test/database'

test.group('HasPermissions', (group) => {
  group.each.setup(async () => {
    await setupDatabase()
    return () => cleanDatabase()
  })

  test('Mixin gets applied succesfully', ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {}

    expect(Model.$relationsDefinitions.get('permissions')!.relationName).toBe('permissions')
    expect(Model.prototype.hasPermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.checkPermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.hasAnyPermission).toEqual(expect.any(Function))
    expect(Model.prototype.hasAllPermissions).toEqual(expect.any(Function))
    expect(Model.prototype.givePermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.syncPermissions).toEqual(expect.any(Function))
    expect(Model.prototype.revokePermissionTo).toEqual(expect.any(Function))
    expect(Model.prototype.getPermissionNames).toEqual(expect.any(Function))
  })

  test('Pivot table name comes from mixin argument', ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {}
    // @ts-expect-error
    expect(Model.$relationsDefinitions.get('permissions')!.options.pivotTable).toBe(
      'model_has_permissions'
    )
  })

  test('Can assign and access related permissions', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})

    for (let i = 0; i < 10; i++) {
      await model.givePermissionTo(`permission-${i}`)
    }
    const permission = await Permission.create({ name: 'permission-3' })
    await model.givePermissionTo(permission)
    await model.load('permissions')
    expect(model.permissions.length).toBe(11)
  })

  test('Can check if a model has a permission', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    const permission = await Permission.findByOrFail('name', 'permission-1')
    expect(await model.hasPermissionTo(permission)).toBe(true)
    expect(await model.hasPermissionTo('permission-1')).toBe(true)
    await expect(model.checkPermissionTo('permission-1')).resolves.toBe(true)
    await expect(model.checkPermissionTo('permission-2')).rejects.toThrow()
  })

  test('Can check if a model has any of the given permissions', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    await model.givePermissionTo('permission-2')
    expect(await model.hasAnyPermission('permission-1', 'permission-2')).toBe(true)
    expect(await model.hasAnyPermission('permission-1', 'permission-3')).toBe(true)
    expect(await model.hasAnyPermission('permission-3', 'permission-4')).toBe(false)
  })

  test('Can check if a model has all of the given permissions', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    await model.givePermissionTo('permission-2')
    expect(await model.hasAllPermissions('permission-1', 'permission-2')).toBe(true)
    expect(await model.hasAllPermissions('permission-1', 'permission-3')).toBe(false)
    expect(await model.hasAllPermissions('permission-3', 'permission-4')).toBe(false)
  })

  test('Can sync model permissions', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    await model.givePermissionTo('permission-2')
    const permission = await Permission.create({ name: 'permission-4' })
    await model.syncPermissions('permission-1', 'permission-3', permission)
    await model.load('permissions')
    expect(model.permissions.length).toBe(3)
    expect(model.permissions.map((p) => p.name)).toEqual(
      expect.arrayContaining(['permission-1', 'permission-3', 'permission-4'])
    )
  })

  test('Can revoke model permissions', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    await model.givePermissionTo('permission-2')
    await model.givePermissionTo('permission-3')
    await model.revokePermissionTo('permission-1')
    const permission = await Permission.findByOrFail('name', 'permission-3')
    await model.revokePermissionTo(permission)
    await model.load('permissions')
    expect(model.permissions.length).toBe(1)
    expect(model.permissions.map((p) => p.name)).toEqual(['permission-2'])
  })

  test('Can get model permission names', async ({ expect }) => {
    const Mixin = HasPermissions('model_has_permissions')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.givePermissionTo('permission-1')
    await model.givePermissionTo('permission-2')
    expect(await model.getPermissionNames()).toEqual(['permission-1', 'permission-2'])
  })
})
