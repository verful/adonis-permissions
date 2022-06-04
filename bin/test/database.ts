import Database from '@ioc:Adonis/Lucid/Database'

export async function createModelsTable() {
  await Database.connection().schema.createTableIfNotExists('models', (table) => {
    table.increments('id').primary()
  })
}

export async function createRolesTable(tableName = 'roles') {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.timestamp('created_at', { useTz: true }).notNullable()
    table.timestamp('updated_at', { useTz: true }).notNullable()
  })
}

export async function createPermissionsTable(tableName = 'permissions') {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.timestamp('created_at', { useTz: true }).notNullable()
    table.timestamp('updated_at', { useTz: true }).notNullable()
  })
}

export async function createRolesPivotTable(tableName = 'model_has_roles', modelTable = 'users') {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.integer('role_id').unsigned().notNullable().references('id').inTable('roles')
    table.integer('model_id').unsigned().notNullable().references('id').inTable(modelTable)
    table.primary(['role_id', 'model_id'])
  })
}

export async function createPermissionsPivotTable(
  tableName = 'model_has_permissions',
  modelTable = 'users'
) {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.integer('permission_id').unsigned().notNullable().references('id').inTable('permissions')
    table.integer('model_id').unsigned().notNullable().references('id').inTable(modelTable)
    table.primary(['permission_id', 'model_id'])
  })
}

export async function createRolePermissionsTable(tableName = 'role_has_permissions') {
  await Database.connection().schema.createTableIfNotExists(tableName, (table) => {
    table.integer('model_id').unsigned().notNullable().references('id').inTable('roles')
    table.integer('permission_id').unsigned().notNullable().references('id').inTable('permissions')
    table.primary(['model_id', 'permission_id'])
  })
}

export async function setupDatabase() {
  await createModelsTable()
  await createRolesTable()
  await createPermissionsTable()
  await createRolePermissionsTable()
  await createRolesPivotTable()
  await createPermissionsPivotTable()
}

export async function cleanDatabase({
  rolesTable = 'roles',
  permissionsTable = 'permissions',
  rolePermissionsTable = 'role_has_permissions',
  rolesPivotTable = 'model_has_roles',
  permissionsPivotTable = 'model_has_permissions',
  modelsTable = 'models',
} = {}) {
  await Database.connection().schema.dropTableIfExists(permissionsPivotTable)
  await Database.connection().schema.dropTableIfExists(rolesPivotTable)
  await Database.connection().schema.dropTableIfExists(rolePermissionsTable)
  await Database.connection().schema.dropTableIfExists(permissionsTable)
  await Database.connection().schema.dropTableIfExists(rolesTable)
  await Database.connection().schema.dropTableIfExists(modelsTable)
}
