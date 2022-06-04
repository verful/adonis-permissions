import { join } from 'path'
import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class PivotTable extends BaseCommand {
  public static commandName = 'permissions:pivot-table'
  public static description = 'Create the pivot table migration for authorizable models'

  /**
   * This command loads the application
   */
  public static settings = {
    loadApp: true,
  }

  /**
   * Execute command
   */
  public async run(): Promise<void> {
    const stub = join(__dirname, '..', 'templates', 'migrations', 'pivot.txt')

    const modelName = await this.prompt.ask('Enter the model name', {
      default: 'User',
      validate: (value) => !!value.trim().length,
      result: (value) => value.toLowerCase(),
    })

    const permissionsTableName = await this.prompt.ask('Enter the permissions pivot table name', {
      default: `${modelName}_has_permissions`,
      validate(value) {
        return !!value.trim().length
      },
    })

    const rolesTableName = await this.prompt.ask('Enter the roles pivot table name', {
      default: `${modelName}_has_roles`,
      validate(value) {
        return !!value.trim().length
      },
    })

    this.generator
      .addFile(`${Date.now()}_${modelName}_permissions`)
      .appRoot(this.application.appRoot)
      .destinationDir(this.application.directoriesMap.get('migrations') || 'database')
      .useMustache()
      .stub(stub)
      .apply({
        pivotSchemaName: `${this.application.helpers.string.capitalCase(modelName)}Permissions`,
        permissionPivotTable: permissionsTableName,
        rolePivotTable: rolesTableName,
        modelTable: this.application.helpers.string.pluralize(modelName),
        rolesTable: this.application.config.get('permissions.tableNames.roles'),
        permissionsTable: this.application.config.get('permissions.tableNames.permissions'),
      })

    await this.generator.run()
  }
}
