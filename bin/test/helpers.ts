import { HasPermissionsModel } from '@ioc:Verful/Permissions'

let counter = 0

export async function createPermission(model: HasPermissionsModel) {
  await model.givePermissionTo(`permission-${counter++}`)
}
