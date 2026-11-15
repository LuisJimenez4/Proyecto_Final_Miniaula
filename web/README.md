# MiniAula — Frontend (React 19 + Vite)

SPA con **React 19**, **Vite**, **Tailwind CSS**, **react-router-dom v7**, **React Hook Form**, **Zod** y **Axios**.
Consume la API de `../Backend_miniAula`. Reglas de trabajo en [`AGENTS.md`](AGENTS.md), estado en [`MEMORY.md`](MEMORY.md).

## Desarrollo

```bash
cp .env.example .env     # VITE_API_URL=http://localhost:3000/api
pnpm install
pnpm dev              # http://localhost:5173
pnpm build
```

`VITE_API_URL` es obligatoria: sin ella la app falla al arrancar con un mensaje claro. Vite la incrusta al compilar.

## Docker

Primero levanta la API (`docker compose up --build` en `../Backend_miniAula`, puerto 3000). Luego:

```bash
docker compose up --build      # http://localhost:5173
# o a mano:
docker build -t miniaula-web --build-arg VITE_API_URL=http://localhost:3000/api .
docker run -d -p 5173:80 miniaula-web
```

La API acepta por CORS el origen `http://localhost:5173` (`CORS_ORIGIN`).

## Cuentas del seed (contraseña `password123`)

| Rol | Email |
|---|---|
| Instructor | `garcia@miniaula.com`, `martinez@miniaula.com` |
| Estudiante | `ana@estudiante.com`, `carlos@estudiante.com`, `maria@estudiante.com` |

En desarrollo, el login muestra botones de acceso rápido; en producción no.

## Rutas

| Ruta | Rol |
|---|---|
| `/catalogo`, `/cursos/:id`, `/login`, `/registro` | público |
| `/mis-cursos`, `/mis-cursos/:cursoId`, `/mis-cursos/:cursoId/lecciones/:leccionId` | estudiante |
| `/instructor/cursos`, `/nuevo`, `/:id/editar`, `/:id/resumen`, `/:id/lecciones/nueva`, `/:id/lecciones/:leccionId` | instructor |
| `/perfil` | autenticado |

## Arquitectura

- Servicios (`src/services/`): cada función devuelve `new Promise` y resuelve `response.data`.
- Errores de la API: `utils/apiError.js` los convierte a mensajes y a errores por campo del formulario.
- Estados de pantalla: `StatusFeedback` (carga, error con reintento, vacío).
- Las reglas (desbloqueo secuencial, intentos, notas, publicación) las decide la API; el front muestra su respuesta.
