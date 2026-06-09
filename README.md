# CLIMAS - Sistema de Gestión Clínica

CLIMAS es una aplicación integral para la gestión de clínicas médicas. Permite administrar pacientes, médicos, especialidades (áreas), servicios y agendar consultas médicas, además de llevar un control de los historiales clínicos y una auditoría de acciones.

El proyecto está estructurado como un **monorepo**, separando claramente la lógica del servidor (backend) y la interfaz de usuario (frontend).

## Tecnologias Utilizadas

### Frontend
- **HTML5 & CSS3**
- **Vanilla JavaScript** (Módulos ES)
- **FontAwesome** (Iconos)

### Backend
- **Node.js** con **NestJS** (Framework principal)
- **Prisma ORM** (Gestión de base de datos)
- **PostgreSQL** (Motor de Base de Datos)
- **Swagger** (Documentación de la API REST)
- **JWT & Bcrypt** (Autenticación y Seguridad)
- **Jest** (Testing)

---

## Estructura del Repositorio

- `/frontend`: Contiene la aplicación web (HTML, hojas de estilo en CSS y lógica en JavaScript).
- `/backend`: Contiene la API REST desarrollada con NestJS y la configuración de la base de datos (esquema de Prisma).

---

## Requisitos Previos

Asegúrate de tener instalado lo siguiente en tu entorno local:
- [Node.js](https://nodejs.org/) (v18 o superior)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

---

## Instalacion y Ejecucion

### Backend

1. Ingresa al directorio del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Configura las variables de entorno. Crea o edita el archivo `.env` en la raíz de la carpeta `backend/` definiendo tu conexión a PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/climas_db?schema=public"
   ```
   *(Asegúrate de reemplazar los datos con los de tu entorno local).*

4. Sincroniza el esquema con la base de datos usando Prisma:
   ```bash
   npx prisma db push
   ```
5. Levanta el servidor en modo desarrollo:
   ```bash
   npm run start:dev
   ```
   El backend se ejecutará normalmente en `http://localhost:3000`.

### Frontend

Dado que está construido con Vanilla JS, HTML y CSS:
1. Puedes usar una extensión como **Live Server** (si utilizas VS Code) sobre la carpeta `/frontend` para levantar la web en un servidor local.
2. Otra opción es servir la carpeta usando algún paquete como `serve` o `http-server` para cargar correctamente los módulos de JavaScript.

---

## Documentacion de la API

La API cuenta con documentación interactiva mediante **Swagger**.
- Con el backend en ejecución, navega a: `http://localhost:3000/api/docs`.
- También puedes consultar el archivo estático exportado `CLIMAS-documentation.html` ubicado en la raíz de este proyecto.

---

## Branching (GitFlow)

| Rama | Propósito |
|------|-----------|
| `main` | Producción estable |
| `develop` | Integración de features |
| `feature/*` | Nueva funcionalidad |
| `release/*` | Preparación de release |
| `hotfix/*` | Correcciones urgentes en producción |

### Flujo para contribuir

1. Crear rama desde `develop`: `git checkout -b feature/mi-feature`
2. Commits descriptivos en español/inglés (acordar en equipo)
3. Push y abrir PR hacia `develop`
4. Requiere 1 aprobación para mergear a `develop`, 2 para `main`

---

## Integrantes

- Martín Castillo
- Diego Contreras
- Daniel Durán
