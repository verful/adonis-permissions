import { BaseModel } from '@ioc:Adonis/Lucid/Orm'
import { test } from '@japa/runner'
import Authorizable from '../src/Mixins/Authorizable'
import HasPermissions from '../src/Mixins/HasPermissions'
import HasRoles from '../src/Mixins/HasRoles'

test('Bindings registered correctly', ({ expect, app }) => {
  expect(app.container.resolveBinding('Verful/Permissions/Role').prototype).toBeInstanceOf(
    BaseModel
  )
  expect(app.container.resolveBinding('Verful/Permissions/Permission').prototype).toBeInstanceOf(
    BaseModel
  )
  expect(app.container.resolveBinding('Verful/Permissions/Mixins')).toStrictEqual({
    Authorizable: Authorizable,
    HasRoles: HasRoles,
    HasPermissions: HasPermissions,
  })
})
