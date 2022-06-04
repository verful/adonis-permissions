<div align="center">
  <img src="https://github.com/verful/permissions/raw/main/.github/banner.png" width="1200px">
</div>


<div align="center">
  <h2><b>Adonis Permissions</b></h2>
  <p>Easily manage user roles and permissions</p>
</div>

<div align="center">

[![npm-image]][npm-url] [![license-image]][license-url] [![typescript-image]][typescript-url]

</div>


## **Pre-requisites**
The `@verful/permissions` package requires `@adonisjs/core >= 5` and `@adonisjs/lucid >= 16`

## **Setup**

Install the package from the npm registry as follows.

```
npm i @verful/permissions
# or
yarn add @verful/permissions
```

Next, configure the package by running the following ace command.

```
node ace configure @verful/permissions
```

## **Getting started**
Once the package is installed the first thing you wan't to do is apply the `Authorizable` mixin from `@ioc:Verful/Permissions/Mixins` into a model

```typescript
import { Authorizable } from '@ioc:Verful/Permissions/Mixins'
import { compose } from '@ioc:Adonis/Core/Helpers'
import { BaseModel } from '@ioc:Adonis/Lucid/Orm'

const config = { 
  permissionsPivotTable: 'user_has_permissions',
  rolesPivotTable: 'user_has_roles'
}

export default class User extends compose(BaseModel, Authorizable(config)) {}
```

After the mixin is applied you can do stuff like this
```typescript
await user.givePermissionTo('view-users')
await user.assignRole('admin')

await role.givePermissionTo('edit-users')
```

## **Basic usage**
The package allows you to associate Lucid models with roles and permissions. Roles and Permissions are just Lucid models that can be directly managed like any other model

```typescript
import Permission from '@ioc:Verful/Permissions/Permission'
import Role from '@ioc:Verful/Permissions/Role'

const role = await Role.create({ name: 'writer' })
const permission = await Permission.create({ name: 'edit-posts' })
```

### **Managing permissions**
You can manage permissions for roles and models using the same methods

```typescript
// Assigning permissions
await role.givePermissionTo('do-things')

// Removing permissions
await user.revokePermissionTo('do-things')

// Synchronize permissions
await role.syncPermissions('do-things', 'try-things')
```

### **Checking for permissions**
```typescript
// Checking permissions
await role.hasPermissionTo('do-things') // returns true or false
await user.checkPermissionTo('do-things') // returns true or throws

// Returns true if the model has any of the given permissions
await role.hasAnyPermission('do-things', 'try-things') 

// Returns true if the model has all of the given permissions
await user.hasAllPermissions('do-things', 'try-things')

// Returns all permission names
await user.getPermissionNames()
```

### **Managing Roles**
You can manage roles for models using the `Authorizable` mixin

```typescript
// Assign role
await user.assignRole('admin')

// Revoke role
await user.revokeRole('admin')

// Synchronize roles
await user.syncRoles('admin', 'writer', role)
```

### **Checking for roles**
Generally you should be checking against permissions vs checking for roles, but if you want to check against a role instead use one of the following methods

```typescript
await user.hasRole('admin')

// Returns true if the model has any of the given permissions
await role.hasAnyRoles('admin', 'writer') 

// Returns true if the model has all of the given permissions
await user.hasAllRoles('admin', 'writer')

// Returns all role names
await user.getRoleNames()
```

### **Accessing direct and role permissions**
```typescript
// Check if the model has the permission directly
await user.hasDirectPermission('do-things')

// Check if the model has the permission via role
await user.hasPermissionViaRole('do-things')

// Get all direct permissions
await user.getDirectPermissions()

// Get all permissions via roles
await user.getPermissionsViaRoles()

// Get all permissions combined
await user.getAllPermissions()
```


[npm-image]: https://img.shields.io/npm/v/@verful/permissions.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@verful/permissions "npm"

[license-image]: https://img.shields.io/npm/l/@verful/permissions?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"
