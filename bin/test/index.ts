import 'reflect-metadata'

import { expect } from '@japa/expect'
import { specReporter } from '@japa/spec-reporter'
import { processCliArgs, configure, run, TestContext } from '@japa/runner'
import { Application } from '@adonisjs/core/build/standalone'
import { Filesystem } from '@poppinss/dev-utils'
import { resolve } from 'path'

import { createAppConfig, createDatabaseConfig, createPermissionsConfig } from './config'
/*
|--------------------------------------------------------------------------
| Configure tests
|--------------------------------------------------------------------------
|
| The configure method accepts the configuration to configure the Japa
| tests runner.
|
| The first method call "processCliArgs" process the command line arguments
| and turns them into a config object. Using this method is not mandatory.
|
| Please consult japa.dev/runner-config for the config docs.
*/
const fs = new Filesystem(resolve(__dirname, '..', 'tmp'))

configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    files: ['tests/**/*.ts'],
    plugins: [expect()],
    reporters: [specReporter()],
    importer: (filePath: string) => import(filePath),
    setup: [
      async () => {
        await fs.add('.env', '')
        await createAppConfig(fs)
        await createDatabaseConfig(fs)
        await createPermissionsConfig(fs)

        const app = new Application(fs.basePath, 'test', {
          providers: ['@adonisjs/core', '@adonisjs/lucid', '../../providers/PermissionsProvider'],
        })

        await app.setup()
        await app.registerProviders()
        await app.bootProviders()

        return async () => {
          const db = app.container.use('Adonis/Lucid/Database')
          await db.manager.closeAll()
          await app.shutdown()
          await fs.cleanup()
        }
      },
    ],
  },
})

/**
 * Setup context
 */
TestContext.getter('app', () => require('@ioc:Adonis/Core/Application'))

TestContext.macro(
  'getAuthorizable',
  async (
    config = {
      permissionsPivotTable: 'authorizable_has_permissions',
      rolesPivotTable: 'authorizable_has_roles',
    },
    persisted = true
  ) => {
    const { default: authorizableFactory } = await import('./authorizableFactory')
    return authorizableFactory(config, persisted)
  }
)
/*
|--------------------------------------------------------------------------
| Run tests
|--------------------------------------------------------------------------
|
| The following "run" method is required to execute all the tests.
|
*/
run()
