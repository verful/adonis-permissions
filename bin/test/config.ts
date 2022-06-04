import { resolve } from 'path'

import type { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import type { PermissionsConfigContract } from '@ioc:Verful/Permissions'
import { Filesystem } from '@poppinss/dev-utils'

const database: DatabaseConfig = {
  connection: 'sqlite',
  connections: {
    sqlite: {
      client: 'sqlite',
      connection: {
        filename: resolve(__dirname, '../tmp/database.sqlite'),
      },
    },
  },
}

const permissions: PermissionsConfigContract = {
  tableNames: {
    permissions: 'permissions',
    roles: 'roles',
    roleHasPermissions: 'role_has_permissions',
  },
}

export async function createAppConfig(fs: Filesystem) {
  await fs.add(
    'config/app.ts',
    `
		export const appKey = 'averylong32charsrandomsecretkey',
		export const http = {
			cookie: {},
			trustProxy: () => true,
		}
	`
  )
}

export async function createDatabaseConfig(fs: Filesystem) {
  await fs.add(
    'config/database.ts',
    `
		const databaseConfig = ${JSON.stringify(database, null, 2)}
		export default databaseConfig
	`
  )
}

export async function createPermissionsConfig(fs: Filesystem) {
  await fs.add(
    'config/permissions.ts',
    `
    const permissionsConfig = ${JSON.stringify(permissions, null, 2)}
    export default permissionsConfig
  `
  )
}
