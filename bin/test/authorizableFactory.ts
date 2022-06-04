import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { compose } from '@poppinss/utils/build/helpers'
import { Authorizable } from '@ioc:Verful/Permissions/Mixins'
import { AuthorizableConfig, AuthorizableModel } from '@ioc:Verful/Permissions'

export default async function authorizableFactory(
  config: AuthorizableConfig,
  persisted = true
): Promise<AuthorizableModel> {
  class User extends compose(BaseModel, Authorizable(config)) {
    @column({ isPrimary: true })
    public id: number
  }

  return persisted ? User.create({}) : new User()
}
