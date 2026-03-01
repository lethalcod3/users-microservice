# Users Microservice — Guía de Integración para el Gateway

## Información General

| Propiedad          | Valor                       |
| ------------------ | --------------------------- |
| Transporte         | **TCP**                     |
| Host               | Según `envs.host`           |
| Puerto             | Según `envs.port`           |
| Transporte Eventos | **RabbitMQ** (`riff_queue`) |

> El gateway se comunica con este microservicio vía **TCP** usando `client.send(pattern, payload)`.  
> Los eventos internos entre microservicios se emiten por **RabbitMQ** (no es necesario que el gateway los maneje, a menos que los escuche).

---

## 1. Users

### 1.1 `createUser`

Crea un usuario estándar (con email y contraseña).

```ts
// Gateway → Microservice
client.send('createUser', createUserDto);
```

**Payload:**

```json
{
  "name": "string (requerido)",
  "email": "string (requerido)",
  "password": "string (requerido)",
  "googleId": "string (opcional)",
  "biography": "string (opcional)",
  "role": "USER | ARTIST (opcional, default: USER)"
}
```

**Respuesta exitosa:** Objeto `User` creado (incluye `id`, `name`, `email`, `googleId`, `biography`, `role`, `status`, `createdAt`).

---

### 1.2 `findAllUsers`

Obtiene todos los usuarios activos (`status: true`).

```ts
// Gateway → Microservice
client.send('findAllUsers', {});
```

**Payload:** Vacío (`{}`).

**Respuesta:** Array de objetos `User`.

---

### 1.3 `findOneUser`

Busca un usuario activo por UUID.

```ts
// Gateway → Microservice
client.send('findOneUser', id);
```

**Payload:** `string` — UUID del usuario.

**Respuesta:** Objeto `User` o RpcException `404` si no existe.

---

### 1.4 `updateUser`

Actualiza un usuario existente (parcial).

```ts
// Gateway → Microservice
client.send('updateUser', updateUserDto);
```

**Payload:**

```json
{
  "id": "string (requerido, UUID)",
  "name": "string (opcional)",
  "email": "string (opcional)",
  "password": "string (opcional)",
  "googleId": "string (opcional)",
  "biography": "string (opcional)",
  "role": "USER | ARTIST (opcional)"
}
```

**Respuesta:** Objeto `User` actualizado.

---

### 1.5 `removeUser`

Elimina un usuario de la base de datos (hard delete).

```ts
// Gateway → Microservice
client.send('removeUser', id);
```

**Payload:** `string` — UUID del usuario.

**Respuesta:** Objeto `User` eliminado.

---

### 1.6 `deactivateUser`

Desactiva un usuario (soft delete). Cambia `status` a `false`, anonimiza nombre y biografía. Emite evento RabbitMQ `user.deactivated`.

```ts
// Gateway → Microservice
client.send('deactivateUser', id);
```

**Payload:** `string` — UUID del usuario.

**Respuesta:**

```json
{ "message": "Account deactivated succesfully" }
```

**Evento emitido (RabbitMQ):** `user.deactivated` → `{ "userId": "string" }`

---

### 1.7 `findUserByEmail`

Busca un usuario activo por email.

```ts
// Gateway → Microservice
client.send('findUserByEmail', { email });
```

**Payload:**

```json
{
  "email": "string (requerido)"
}
```

**Respuesta:** Objeto `User` o RpcException `404`.

---

### 1.8 `login`

Autentica un usuario con email y contraseña. Retorna JWT.

```ts
// Gateway → Microservice
client.send('login', { email, password });
```

**Payload:**

```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Respuesta exitosa:**

```json
{
  "token": "string (JWT)",
  "user": { "id", "name", "email", "role", ... }
}
```

**Errores posibles:**

- `401 Unauthorized` — Credenciales inválidas.
- `400 Bad Request` — La cuenta usa Google para login (no tiene contraseña).

---

### 1.9 `createUserGoogle`

Crea o retorna un usuario registrado con Google.

```ts
// Gateway → Microservice
client.send('createUserGoogle', payload);
```

**Payload:**

```json
{
  "name": "string",
  "email": "string",
  "googleId": "string",
  "role": "USER | ARTIST (opcional, default: USER)"
}
```

**Respuesta:** Objeto `User` (existente o recién creado).

---

### 1.10 `generateToken`

Genera un JWT para un usuario dado.

```ts
// Gateway → Microservice
client.send('generateToken', user);
```

**Payload:**

```json
{
  "id": "string",
  "email": "string",
  "role": "USER | ARTIST"
}
```

**Respuesta:** `string` — Token JWT (expira en 24h).

---

### 1.11 `addPassword`

Agrega una contraseña a un usuario que se registró con Google (y no tiene password).

```ts
// Gateway → Microservice
client.send('addPassword', { id, newPassword });
```

**Payload:**

```json
{
  "id": "string (UUID del usuario)",
  "newPassword": "string"
}
```

**Respuesta:** Objeto `User` actualizado.

**Errores:** `400 Bad Request` si el usuario ya tiene contraseña registrada.

---

## 2. Social Media

### 2.1 `createSocialMedia`

Asocia una red social (URL) a un usuario.

```ts
// Gateway → Microservice
client.send('createSocialMedia', createSocialMediaDto);
```

**Payload:**

```json
{
  "userId": "string (requerido, UUID)",
  "url": "string (requerido)"
}
```

**Respuesta:** Objeto `SocialMedia` creado (`id`, `userId`, `url`, `createdAt`).

---

### 2.2 `findAllSocialMedia`

Obtiene todas las redes sociales registradas.

```ts
// Gateway → Microservice
client.send('findAllSocialMedia', {});
```

**Payload:** Vacío (`{}`).

**Respuesta:** Array de objetos `SocialMedia`.

---

### 2.3 `findOneSocialMedia`

Busca una red social por UUID.

```ts
// Gateway → Microservice
client.send('findOneSocialMedia', id);
```

**Payload:** `string` — UUID del registro.

**Respuesta:** Objeto `SocialMedia` o RpcException `404`.

---

### 2.4 `updateSocialMedia`

Actualiza una red social existente.

```ts
// Gateway → Microservice
client.send('updateSocialMedia', updateSocialMediaDto);
```

**Payload:**

```json
{
  "id": "string (requerido, UUID)",
  "userId": "string (opcional)",
  "url": "string (opcional)"
}
```

**Respuesta:** Objeto `SocialMedia` actualizado.

---

### 2.5 `removeSocialMedia`

Elimina una red social por UUID.

```ts
// Gateway → Microservice
client.send('removeSocialMedia', id);
```

**Payload:** `string` — UUID del registro.

**Respuesta:** Objeto `SocialMedia` eliminado.

---

## 3. User Follows

### 3.1 `toggleUserFollow`

Sigue o deja de seguir a un usuario (toggle). Emite eventos RabbitMQ.

```ts
// Gateway → Microservice
client.send('toggleUserFollow', createUserFollowDto);
```

**Payload:**

```json
{
  "followerId": "string (requerido, UUID del que sigue)",
  "followedId": "string (requerido, UUID del seguido)"
}
```

**Respuesta (seguir):**

```json
{
  "following": true,
  "message": "Ahora se sigue al usuario {followedId}"
}
```

**Respuesta (dejar de seguir):**

```json
{
  "following": false,
  "message": "Se dejo de seguir al usuario {followedId}"
}
```

**Eventos emitidos (RabbitMQ):**

- `follow.created` →
  ```json
  {
    "follower_id": "string",
    "follower_email": "string",
    "follower_name": "string",
    "followed_id": "string"
  }
  ```
- `follow.removed` →
  ```json
  {
    "follower_id": "string",
    "followed_id": "string"
  }
  ```

**Errores:** `400 Bad Request` si `followerId === followedId`.

---

### 3.2 `findAllUserFollows`

Obtiene todos los seguidos de un usuario.

```ts
// Gateway → Microservice
client.send('findAllUserFollows', followerId);
```

**Payload:** `string` — UUID del seguidor.

**Respuesta:** Array de objetos `UserFollows` (`followerId`, `followedId`, `createdAt`).

---

### 3.3 `findOneUserFollow`

Verifica si un usuario sigue a otro.

```ts
// Gateway → Microservice
client.send('findOneUserFollow', { followerId, followedId });
```

**Payload:**

```json
{
  "followerId": "string (UUID)",
  "followedId": "string (UUID)"
}
```

**Respuesta:** Objeto `UserFollows` o `null`.

---

### 3.4 `findFollowers`

Obtiene la lista de IDs de los seguidores de un usuario.

```ts
// Gateway → Microservice
client.send('findFollowers', { userId });
```

**Payload:**

```json
{
  "userId": "string (UUID)"
}
```

**Respuesta:** `string[]` — Array de UUIDs de los seguidores.

---

## 4. User Stats (MongoDB)

### 4.1 `findUserStats`

Obtiene las estadísticas de un usuario.

```ts
// Gateway → Microservice
client.send('findUserStats', sqlUserId);
```

**Payload:** `string` — UUID del usuario (el mismo `id` de la tabla `users` en PostgreSQL).

**Respuesta:**

```json
{
  "_id": "ObjectId",
  "sqlUserId": "string",
  "profileViews": 0,
  "createdAt": "Date"
}
```

**Errores:** `404` si no se encuentran stats.

---

### 4.2 `incrementProfileViews`

Incrementa en 1 las vistas de perfil de un usuario.

```ts
// Gateway → Microservice
client.send('incrementProfileViews', sqlUserId);
```

**Payload:** `string` — UUID del usuario.

**Respuesta:** Objeto `UserStats` actualizado con `profileViews` incrementado.

---

## 5. Password Resets

### 5.1 `sendPasswordReset`

Genera un token de recuperación y emite un evento RabbitMQ para enviar el email de reset.

```ts
// Gateway → Microservice
client.send('sendPasswordReset', mailDto);
```

**Payload:**

```json
{
  "mail": "string (requerido, email válido)"
}
```

**Respuesta:**

```json
{ "message": "Password reset email sent" }
```

**Evento emitido (RabbitMQ):** `send.resetPassword` →

```json
{
  "mail": "string",
  "userId": "string",
  "userName": "string",
  "token": "string (token raw, no hasheado)"
}
```

**Errores:** `404` si no existe un usuario con ese email.

---

### 5.2 `updatePasswordReset`

Recibe un token de reset y la nueva contraseña. Actualiza la contraseña del usuario.

```ts
// Gateway → Microservice
client.send('updatePasswordReset', passwordTokenDto);
```

**Payload:**

```json
{
  "token": "string (requerido, token recibido por email)",
  "password": "string (requerido, nueva contraseña)"
}
```

**Respuesta:**

```json
{ "message": "Password updated successfully" }
```

**Errores:** `400 Bad Request` si el token es inválido o expirado.

---

## Resumen de Message Patterns

| #   | Pattern                 | Payload                               | Módulo          |
| --- | ----------------------- | ------------------------------------- | --------------- |
| 1   | `createUser`            | `CreateUserDto`                       | Users           |
| 2   | `findAllUsers`          | `{}`                                  | Users           |
| 3   | `findOneUser`           | `string (UUID)`                       | Users           |
| 4   | `updateUser`            | `UpdateUserDto`                       | Users           |
| 5   | `removeUser`            | `string (UUID)`                       | Users           |
| 6   | `deactivateUser`        | `string (UUID)`                       | Users           |
| 7   | `findUserByEmail`       | `{ email: string }`                   | Users           |
| 8   | `login`                 | `{ email: string, password: string }` | Users           |
| 9   | `createUserGoogle`      | `{ name, email, googleId, role? }`    | Users           |
| 10  | `generateToken`         | `{ id, email, role }`                 | Users           |
| 11  | `addPassword`           | `{ id: string, newPassword: string }` | Users           |
| 12  | `createSocialMedia`     | `CreateSocialMediaDto`                | Social Media    |
| 13  | `findAllSocialMedia`    | `{}`                                  | Social Media    |
| 14  | `findOneSocialMedia`    | `string (UUID)`                       | Social Media    |
| 15  | `updateSocialMedia`     | `UpdateSocialMediaDto`                | Social Media    |
| 16  | `removeSocialMedia`     | `string (UUID)`                       | Social Media    |
| 17  | `toggleUserFollow`      | `CreateUserFollowDto`                 | User Follows    |
| 18  | `findAllUserFollows`    | `string (followerId)`                 | User Follows    |
| 19  | `findOneUserFollow`     | `{ followerId, followedId }`          | User Follows    |
| 20  | `findFollowers`         | `{ userId: string }`                  | User Follows    |
| 21  | `findUserStats`         | `string (sqlUserId)`                  | User Stats      |
| 22  | `incrementProfileViews` | `string (sqlUserId)`                  | User Stats      |
| 23  | `sendPasswordReset`     | `{ mail: string }`                    | Password Resets |
| 24  | `updatePasswordReset`   | `{ token: string, password: string }` | Password Resets |

---

## Eventos RabbitMQ emitidos por el Microservicio

Estos eventos son emitidos internamente por el microservicio hacia la cola `riff_queue`. El gateway **no** necesita enviarlos, pero puede escucharlos si requiere reaccionar a ellos.

| Evento               | Emisor                      | Payload                                                       |
| -------------------- | --------------------------- | ------------------------------------------------------------- |
| `user.deactivated`   | UsersService                | `{ userId: string }`                                          |
| `follow.created`     | UserFollowsService          | `{ follower_id, follower_email, follower_name, followed_id }` |
| `follow.removed`     | UserFollowsService          | `{ follower_id, followed_id }`                                |
| `send.resetPassword` | PasswordResetsSenderService | `{ mail, userId, userName, token }`                           |

---

## Ejemplo de Configuración en el Gateway

```ts
// gateway: users-ms.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.USERS_MS_HOST ?? 'localhost',
          port: Number(process.env.USERS_MS_PORT) ?? 3001,
        },
      },
    ]),
  ],
  // ... controllers, providers
})
export class UsersMsModule {}
```

```ts
// gateway: users.controller.ts (ejemplo)
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly client: ClientProxy) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.client.send('createUser', createUserDto);
  }

  @Get()
  findAll() {
    return this.client.send('findAllUsers', {});
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.client.send('findOneUser', id);
  }
}
```
