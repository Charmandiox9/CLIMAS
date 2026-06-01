# Unit Tests — Documentación

Ejecutar con:
```bash
npx jest --config test/jest-unit.json
```

---

## auth.service.spec.ts

Testea `AuthService` — autenticación y registro de usuarios.

### `login`
| Test | Qué verifica |
|---|---|
| Credenciales válidas | Retorna `access_token` y datos del usuario (`message`, `email`, `roles`) |
| Usuario no existe | Lanza `UnauthorizedException` |
| Contraseña incorrecta | Lanza `UnauthorizedException` |

### `register`
| Test | Qué verifica |
|---|---|
| Registro exitoso | Crea usuario, retorna `access_token` y `message: 'Registro exitoso'` |
| Hasheo de contraseña | La password guardada en DB es hash bcrypt, no texto plano |
| Email o RUT duplicado | Lanza `ConflictException` y no llama a `prisma.user.create` |

---

## user.service.spec.ts

Testea `UserService` — CRUD de usuarios.

### `create`
| Test | Qué verifica |
|---|---|
| Creación exitosa | Usuario creado cuando RUT y email son únicos |
| Hasheo de contraseña | La password se guarda como hash bcrypt |
| RUT duplicado | Lanza `BadRequestException('El RUT ya existe')` sin llegar a `create` |
| Email duplicado | Lanza `BadRequestException('El email ya existe')` sin llegar a `create` |

### `findAll`
| Test | Qué verifica |
|---|---|
| Lista con usuarios | Retorna el array completo de usuarios |
| Sin usuarios | Retorna array vacío sin errores |

### `findOne`
| Test | Qué verifica |
|---|---|
| ID existente | Retorna el usuario correcto |
| ID inexistente | Retorna `null` |

### `update`
| Test | Qué verifica |
|---|---|
| Usuario no encontrado | Lanza `BadRequestException('Usuario no encontrado')` |
| Con nueva contraseña | La nueva password se hashea antes de guardar |
| Sin nueva contraseña | El campo `password` no se incluye en el update |

---

## medical-record.service.spec.ts

Testea `MedicalRecordService` — gestión de registros médicos.

### `create`
| Test | Qué verifica |
|---|---|
| Creación exitosa | Retorna el registro con todos sus campos y relaciones |

### `findAll`
| Test | Qué verifica |
|---|---|
| Con registros | Retorna el listado completo |
| Sin registros | Lanza `BadRequestException('No hay registros médicos')` |

### `findOne`
| Test | Qué verifica |
|---|---|
| ID existente | Retorna el registro correcto |
| ID inexistente | Lanza `BadRequestException('No hay registro médico con este ID')` |

### `findByPatientId`
| Test | Qué verifica |
|---|---|
| Paciente no existe | Lanza `BadRequestException('No hay usuario con este ID')` |
| Paciente con registros | Retorna los registros del paciente |
| Paciente sin registros | Lanza `BadRequestException('No hay registros médicos')` |

### `findByDoctorId`
| Test | Qué verifica |
|---|---|
| Doctor no existe | Lanza `BadRequestException('No hay usuario con este ID')` |
| Doctor con registros | Retorna los registros del doctor |

### `update`
| Test | Qué verifica |
|---|---|
| Update exitoso | Retorna el registro con los nuevos valores |

### `remove`
| Test | Qué verifica |
|---|---|
| Eliminación exitosa | Retorna el registro eliminado y llama a `delete` con el ID correcto |
