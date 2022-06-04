import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { HasRoles } from '@ioc:Verful/Permissions/Mixins'
import Role from '@ioc:Verful/Permissions/Role'
import { test } from '@japa/runner'
import { cleanDatabase, setupDatabase } from '../bin/test/database'

test.group('HasRoles', (group) => {
  group.each.setup(async () => {
    await setupDatabase()
    return () => cleanDatabase()
  })

  test('Mixin gets applied succesfully', ({ expect }) => {
    const Mixin = HasRoles('model_has_permissions')
    class Model extends Mixin(BaseModel) {}

    expect(Model.$relationsDefinitions.get('roles')!.relationName).toBe('roles')
    expect(Model.prototype.assignRole).toEqual(expect.any(Function))
    expect(Model.prototype.syncRoles).toEqual(expect.any(Function))
    expect(Model.prototype.revokeRole).toEqual(expect.any(Function))
    expect(Model.prototype.hasRole).toEqual(expect.any(Function))
    expect(Model.prototype.hasAnyRoles).toEqual(expect.any(Function))
    expect(Model.prototype.hasAllRoles).toEqual(expect.any(Function))
    expect(Model.prototype.getRoleNames).toEqual(expect.any(Function))
  })

  test('Pivot table name comes from mixin argument', ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {}
    // @ts-expect-error
    expect(Model.$relationsDefinitions.get('roles')!.options.pivotTable).toBe('model_has_roles')
  })

  test('Can assign and access related roles', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})

    for (let i = 0; i < 10; i++) {
      await model.assignRole(`role-${i}`)
    }
    const role = await Role.create({ name: 'role-11' })
    await model.assignRole(role)
    await model.load('roles')
    expect(model.roles.length).toBe(11)
  })

  test('Can check if a model has a role', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    const role = await Role.create({ name: 'role-2' })
    await model.assignRole('role-1')

    expect(await model.hasRole('role-1')).toBe(true)
    expect(await model.hasRole(role)).toBe(false)
  })

  test('Can check if a model has any of the given roles', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    const role = await Role.create({ name: 'role-2' })
    await model.assignRole('role-1')

    expect(await model.hasAnyRoles('role-1', role)).toBe(true)
    expect(await model.hasAnyRoles(role, 'role-2')).toBe(false)
  })

  test('Can check if a model has all of the given roles', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    const role = await Role.create({ name: 'role-2' })
    await model.assignRole('role-1', role)

    expect(await model.hasAllRoles('role-1', role)).toBe(true)
    expect(await model.hasAllRoles('role-1', role, 'role-3')).toBe(false)
  })

  test('Can get role names', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    const role = await Role.create({ name: 'role-2' })
    await model.assignRole('role-1', role)

    expect(await model.getRoleNames()).toEqual(expect.arrayContaining(['role-1', 'role-2']))
  })

  test('Can sync roles', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    await model.assignRole('role-1')
    const role = await Role.create({ name: 'role-2' })

    await model.syncRoles('role-3', role)
    expect(await model.getRoleNames()).toEqual(expect.arrayContaining(['role-3', 'role-2']))
  })

  test('Can remove roles', async ({ expect }) => {
    const Mixin = HasRoles('model_has_roles')
    class Model extends Mixin(BaseModel) {
      @column({ isPrimary: true })
      public id: number
    }
    const model = await Model.create({})
    const role = await Role.create({ name: 'role-2' })
    await model.assignRole('role-1', role)
    await model.assignRole('role-3')
    await model.revokeRole('role-1')
    await model.revokeRole(role)
    await model.load('roles')
    expect(model.roles.length).toBe(1)
    expect(model.roles.map(({ name }) => name)).toEqual(['role-3'])
  })
})
