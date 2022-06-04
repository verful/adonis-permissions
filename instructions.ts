import * as sinkStatic from '@adonisjs/sink'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { join } from 'path'

type InstructionsState = {
  permissionsTableName: string
  rolesTableName: string
  roleHasPermissionsTableName: string
  rolesSchemaName: string
  permissionsSchemaName: string
  roleHasPermissionsSchemaName: string
}

function getStub(...paths: string[]) {
  return join(__dirname, 'templates', ...paths)
}

function makePermissionsMigration(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const migrationsDirectory = app.directoriesMap.get('migrations') || 'database'
  const migrationPath = join(migrationsDirectory, `${Date.now()}_${state.permissionsTableName}.ts`)

  const template = new sink.files.MustacheFile(
    projectRoot,
    migrationPath,
    getStub('migrations/permissions.txt')
  )
  if (template.exists()) {
    sink.logger.action('create').skipped(`${migrationPath} file already exists`)
    return
  }

  template.apply(state).commit()
  sink.logger.action('create').succeeded(migrationPath)
}

function makeRolesMigration(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const migrationsDirectory = app.directoriesMap.get('migrations') || 'database'
  const migrationPath = join(migrationsDirectory, `${Date.now()}_${state.rolesTableName}.ts`)

  const template = new sink.files.MustacheFile(
    projectRoot,
    migrationPath,
    getStub('migrations/roles.txt')
  )
  if (template.exists()) {
    sink.logger.action('create').skipped(`${migrationPath} file already exists`)
    return
  }

  template.apply(state).commit()
  sink.logger.action('create').succeeded(migrationPath)
}

function makeRolesHasPermissionsMigration(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const migrationsDirectory = app.directoriesMap.get('migrations') || 'database'
  const migrationPath = join(
    migrationsDirectory,
    `${Date.now()}_${state.roleHasPermissionsTableName}.ts`
  )

  const template = new sink.files.MustacheFile(
    projectRoot,
    migrationPath,
    getStub('migrations/roles_pivot.txt')
  )
  if (template.exists()) {
    sink.logger.action('create').skipped(`${migrationPath} file already exists`)
    return
  }

  template.apply(state).commit()
  sink.logger.action('create').succeeded(migrationPath)
}

function makeConfig(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic,
  state: InstructionsState
) {
  const configDirectory = app.directoriesMap.get('config') || 'config'
  const configPath = join(configDirectory, 'permissions.ts')

  const template = new sink.files.MustacheFile(projectRoot, configPath, getStub('config.txt'))
  template.overwrite = true

  template.apply(state).commit()
  sink.logger.action('create').succeeded(configPath)
}

async function getMigrationConsent(sink: typeof sinkStatic, tableName: string): Promise<boolean> {
  return sink
    .getPrompt()
    .confirm(`Create migration for the ${sink.logger.colors.underline(tableName)} table?`)
}

async function getPermissionsTableName(sink: typeof sinkStatic): Promise<string> {
  return sink.getPrompt().ask('Enter the permissions table name', {
    default: 'permissions',
    validate(value) {
      return !!value.trim().length
    },
  })
}

async function getRolesTableName(sink: typeof sinkStatic): Promise<string> {
  return sink.getPrompt().ask('Enter the roles table name', {
    default: 'roles',
    validate(value) {
      return !!value.trim().length
    },
  })
}

async function getPermissionRolesPivotTable(sink: typeof sinkStatic): Promise<string> {
  return sink.getPrompt().ask('Enter the roles and permissions pivot table name', {
    default: 'role_has_permissions',
    validate(value) {
      return !!value.trim().length
    },
  })
}

export default async function instructions(
  projectRoot: string,
  app: ApplicationContract,
  sink: typeof sinkStatic
) {
  const state: InstructionsState = {
    rolesSchemaName: 'Roles',
    permissionsSchemaName: 'Permissions',
    roleHasPermissionsSchemaName: 'RoleHasPermissions',
    rolesTableName: '',
    permissionsTableName: '',
    roleHasPermissionsTableName: '',
  }

  state.permissionsTableName = await getPermissionsTableName(sink)
  state.rolesTableName = await getRolesTableName(sink)
  state.roleHasPermissionsTableName = await getPermissionRolesPivotTable(sink)

  const permissionsMigrationConsent = await getMigrationConsent(sink, state.permissionsTableName)
  const rolesMigrationConsent = await getMigrationConsent(sink, state.rolesTableName)
  const rolesHasPermissionsConsent = await getMigrationConsent(
    sink,
    state.roleHasPermissionsTableName
  )
  if (permissionsMigrationConsent) {
    makePermissionsMigration(projectRoot, app, sink, state)
  }
  if (rolesMigrationConsent) {
    makeRolesMigration(projectRoot, app, sink, state)
  }
  if (rolesHasPermissionsConsent) {
    makeRolesHasPermissionsMigration(projectRoot, app, sink, state)
  }

  makeConfig(projectRoot, app, sink, state)
}
