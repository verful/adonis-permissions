import { Expect } from '@japa/expect'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import {
  AuthorizableConfig,
  AuthorizableModel,
  PermissionContract,
  RoleContract,
} from '@ioc:Verful/Permissions'

declare module '@japa/runner' {
  interface TestContext {
    // notify TypeScript about custom context properties
    expect: Expect
    app: ApplicationContract
    getAuthorizable(
      config?: AuthorizableConfig,
      persisted?: boolean
    ): Promise<AuthorizableModel & { id: number }>
    getRole(): Promise<RoleContract>
    getPermission(): Promise<PermissionContract>
  }
}
