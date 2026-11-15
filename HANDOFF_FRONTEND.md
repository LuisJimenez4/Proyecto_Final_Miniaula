# HANDOFF TÉCNICO Y MASTER PROMPT — FRONTEND MINIAULA
> **Para el Agente IA de Desarrollo Frontend:** Este documento contiene el estado real de la arquitectura del backend ya implementada, los contratos de datos (endpoints, payloads, autenticación), las reglas de negocio activas, las convenciones de código obligatorias del docente y el **Master Prompt estructurado en fases** para construir la SPA en React 19 de **MiniAula** con calificación 100/100.

---

## 1. ESTADO DE SITUACIÓN: BACKEND IMPLEMENTADO Y LISTO

El backend se encuentra **100% operativo** en el directorio `api/` bajo una arquitectura en 3 capas desacopladas (Express 5, Sequelize 6, MySQL 8.4, Zod, JWT, bcryptjs).

### 1.1 Conectividad y Variables de Entorno del Frontend
- **Base URL de la API:** `http://localhost:3000/api`
- **Variable de entorno en Vite:** `VITE_API_URL=http://localhost:3000/api`
- **CORS:** Totalmente habilitado en el backend con `cors()`.
- **Swagger UI:** Disponible para consulta viva de esquemas en `http://localhost:3000/api/docs`.
- **Colección Postman:** Disponible en `postman/miniaula.postman_collection.json`.

### 1.2 Formato Canónico de Errores del Backend (RT-B05)
Cualquier error devuelto por la API (código 400, 401, 403, 404, 409, 422, 500) tiene la siguiente estructura estricta:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": ["El título es obligatorio"]
  }
}
```
*El frontend debe extraer `error.response?.data?.error?.message` o `details` para mostrar feedback al usuario.*

### 1.3 Cuentas Pre-cargadas en el Seed de Base de Datos
Todas las contraseñas son: `password123`

| Rol | Nombre | Email | Notas |
| :--- | :--- | :--- | :--- |
| **Instructor** | Prof. García | `garcia@miniaula.com` | Creador de 3 cursos con 5 lecciones y cuestionarios |
| **Instructor** | Prof. Martínez | `martinez@miniaula.com` | Cuenta de instructor libre |
| **Estudiante** | Ana López | `ana@estudiante.com` | Estudiante para pruebas de catálogo e inscripción |
| **Estudiante** | Carlos Ruiz | `carlos@estudiante.com` | Estudiante para pruebas de progreso y notas |
| **Estudiante** | María Torres | `maria@estudiante.com` | Estudiante libre |

---

## 2. MAPA DE ENDPOINTS DISPONIBLES EN EL BACKEND

Todos los endpoints requieren header `Authorization: Bearer <token>` excepto los marcados como `[Público]`.

### Autenticación y Perfil
- `POST /api/auth/register` `[Público]`: Body `{ nombre, email, password, rol }`. Retorna `{ message, user }`.
- `POST /api/auth/login` `[Público] [Rate Limited]`: Body `{ email, password }`. Retorna `{ token, user: { id, nombre, email, rol } }`.
- `GET /api/users/me`: Retorna los datos del usuario autenticado (sin `passwordHash`).
- `PATCH /api/users/me`: Body `{ nombre?, email?, password? }`. Retorna el usuario actualizado.

### Cursos y Catálogo Público
- `GET /api/cursos` `[Público]`: Query params `page`, `limit`, `search`, `categoria`, `nivel`. Retorna `{ cursos, total, page, totalPages }` (solo cursos con `estado: 'publicado'`).
- `GET /api/cursos/:id` `[Público]`: Retorna el curso con su instructor y lecciones ordenadas (sin respuestas correctas).
- `POST /api/cursos/:id/inscripcion` `[Rol: estudiante]`: Inscribe al estudiante en el curso. Lanza `409 ALREADY_ENROLLED` si ya está inscrito.

### Flujo del Estudiante (Inscripciones y Progreso)
- `GET /api/inscripciones` `[Rol: estudiante]`: Retorna las inscripciones del estudiante con porcentaje de avance (`progresoPorcentaje`, `completadas`, `totalLecciones`).
- `GET /api/inscripciones/:id` `[Rol: estudiante]`: Detalle de inscripción por `cursoId`.
- `GET /api/inscripciones/:id/progreso` `[Rol: estudiante]`: Retorna el arreglo de lecciones con su estado `{ leccionId, titulo, tipo, orden, desbloqueada, completada, intentos, mejorNota }`.
- `POST /api/inscripciones/:id/lecciones/:leccionId/completar` `[Rol: estudiante]`: Marca lección de contenido como completada. Requiere que la lección esté desbloqueada (RN-01).
- `POST /api/inscripciones/:id/lecciones/:leccionId/intentos` `[Rol: estudiante]`: Body `{ respuestas: [{ preguntaId, indiceSeleccionado }] }`. Evalúa respuestas, verifica límite de 3 intentos (RN-03) y calcula mejor nota. Retorna `{ nota, aprobado, intentos, mejorNota, completada }`.

### Flujo del Instructor
- `GET /api/instructor/cursos` `[Rol: instructor]`: Cursos del instructor con `totalLecciones` y `totalInscripciones`.
- `POST /api/instructor/cursos` `[Rol: instructor]`: Body `{ titulo, descripcion, categoria, nivel }`. Crea curso en estado `borrador`.
- `PATCH /api/instructor/cursos/:id` `[Rol: instructor]`: Body `{ titulo?, descripcion?, categoria?, nivel? }`.
- `PATCH /api/instructor/cursos/:id/estado` `[Rol: instructor]`: Body `{ estado: 'borrador' | 'publicado' | 'archivado' }`. Exige $\ge 1$ lección para publicar (RN-05).
- `DELETE /api/instructor/cursos/:id` `[Rol: instructor]`: Solo si no tiene inscritos (RN-06).
- `GET /api/instructor/cursos/:id/resumen` `[Rol: instructor]`: Retorna métricas analíticas `{ inscritos, completaron, progresoPromedio, notaPromedio, avancePorLeccion, leccionMayorCaida }` (RF-16).

### Lecciones y Preguntas (Gestión)
- `GET /api/lecciones/curso/:cursoId`: Lista lecciones por orden.
- `GET /api/lecciones/:id`: Detalle de lección (en cuestionarios oculta `indiceCorrecto`, RN-02).
- `POST /api/lecciones/curso/:cursoId` `[Rol: instructor]`: Body `{ titulo, tipo, contenido?, videoUrl?, notaMinima? }`. Calcula orden automático al final.
- `PUT /api/lecciones/curso/:cursoId/reorder` `[Rol: instructor]`: Body `{ orden: [id1, id2, id3] }` para reordenar.
- `PATCH /api/lecciones/:id` `[Rol: instructor]`: Editar lección.
- `DELETE /api/lecciones/:id` `[Rol: instructor]`: Elimina lección y reordena automáticamente las restantes.
- `GET /api/preguntas/leccion/:leccionId`: Lista preguntas (sin `indiceCorrecto`).
- `POST /api/preguntas/leccion/:leccionId` `[Rol: instructor]`: Body `{ enunciado, opciones: ["Op1", "Op2"], indiceCorrecto: 0 }`.
- `PATCH /api/preguntas/:id` `[Rol: instructor]`: Editar pregunta.
- `DELETE /api/preguntas/:id` `[Rol: instructor]`: Eliminar pregunta.

---

## 3. REGLAS ARQUITECTÓNICAS Y CONVENCIONES OBLIGATORIAS DEL FRONTEND

### 3.1 Estructura del Directorio `web/`
```text
web/
├── Dockerfile                  # Build multi-stage (node:22-alpine -> nginx:alpine en puerto 80)
├── nginx.conf                  # Soporte SPA: try_files $uri $uri/ /index.html;
├── .dockerignore
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx
    ├── App.css
    ├── config/
    │   ├── axiosClient.js       # BaseURL + Interceptores Bearer y 401
    │   └── navigationRef.js     # Redirección 401 fuera del árbol React
    ├── context/
    │   └── AuthContext.jsx      # Provee { user, token, isLoggedIn, login, logout, updateUser }
    ├── hooks/
    │   ├── useAuth.js           # Acceso rápido a AuthContext
    │   ├── useFetch.js          # Manejador genérico de peticiones asíncronas
    │   └── useProgreso.js       # Lógica de desbloqueo y estado de lecciones
    ├── services/                # Regla del docente: RETORNAN new Promise((resolve, reject) => ...)
    │   ├── AuthService.js
    │   ├── UserService.js
    │   ├── CursoService.js
    │   ├── LeccionService.js
    │   ├── PreguntaService.js
    │   ├── InscripcionService.js
    │   └── InstructorService.js
    ├── routes/
    │   ├── NavigationHandler.jsx
    │   ├── AuthenticatedRoute.jsx # Protege rutas privadas
    │   ├── RoleRoute.jsx          # Protege por rol ('estudiante' | 'instructor')
    │   └── RouterConfig.jsx       # Rutas declaradas
    ├── components/
    │   ├── Navbar.jsx             # Responsivo con menú hamburguesa
    │   ├── Button.jsx
    │   ├── FormInput.jsx
    │   ├── StatusFeedback.jsx     # Loading, Error y EmptyState (RT-F06)
    │   └── Pagination.jsx
    └── pages/
        ├── auth/
        │   ├── FormLogin.jsx
        │   ├── FormRegistro.jsx
        │   └── PerfilPage.jsx
        ├── catalogo/
        │   ├── CatalogoList.jsx   # Filtros por categoría, nivel, búsqueda y paginación
        │   └── CursoDetalle.jsx   # Vista de temario y botón de inscripción
        ├── estudiante/
        │   ├── MisCursosList.jsx  # Grid de cursos con barra de progreso
        │   ├── LeccionView.jsx    # Visor de contenido, video y botón de completar
        │   └── CuestionarioView.jsx # Cuestionario con límite de 3 intentos y feedback
        └── instructor/
            ├── InstructorCursosList.jsx # Lista con contadores y cambio de estado
            ├── EditorCurso.jsx    # Formulario + Reordenamiento de lecciones
            ├── EditorLeccion.jsx  # Editor de lección + Gestor de preguntas
            └── PanelCurso.jsx     # Métricas y gráfico de caída (RF-16)
```

### 3.2 Regla Estricta del Docente: Servicios con Promesas Explícitas
En la carpeta `web/src/services/`, **NO** se usa `return axiosClient.get(...)` directamente. Debe usarse la convención oficial del docente de envolver en `new Promise`:
```javascript
import axiosClient from '../config/axiosClient';

export const getCursos = (params) => {
  return new Promise((resolve, reject) => {
    axiosClient.get('/cursos', { params })
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
};
```

### 3.3 Regla RT-F06: Estados de UI Obligatorios
Toda vista que consulte datos asíncronos debe manejar explícitamente:
1. `loading`: Skeleton o spinner legible.
2. `error`: Mensaje amigable con botón de reintentar.
3. `empty` (`data.length === 0`): Ilustración o mensaje claro indicando que no hay elementos.

### 3.4 Regla RT-F07: Diseño Responsivo desde 375px
- Tailwind CSS desde mobile-first (`px-4 py-2 text-sm md:text-base`).
- Menú hamburguesa funcional en Navbar para móviles.
- Tablas con scroll horizontal o tarjetas apiladas en pantallas pequeñas.

---

## 4. MASTER PROMPT PARA EL AGENTE DE FRONTEND

> **INSTRUCCIONES PARA EL AGENTE:** Copia y envía el siguiente bloque de texto tal cual a tu nuevo agente o subagente para iniciar la implementación del Frontend en la carpeta `web/`.

```markdown
Hola Agente. Tu tarea es construir la aplicación SPA de frontend para el proyecto "MiniAula" dentro del directorio `web/` en la raíz de nuestro monorepo `c:\Users\Alejandro\Desktop\Backend_miniAula\web\`.

El backend ya está 100% implementado y probado en `api/`, sirviendo endpoints REST en `http://localhost:3000/api`. Consulta el archivo `HANDOFF_FRONTEND.md` para ver el detalle de los endpoints y modelos.

### REQUISITOS TECNOLÓGICOS:
- React 19 + Vite + JavaScript (JSX).
- React Router DOM v6/v7 para enrutamiento.
- Axios con interceptores de Bearer token y redirección 401.
- React Hook Form + Zod (@hookform/resolvers/zod) para formularios.
- Tailwind CSS para estilos modernos y responsivos desde 375px.

### REGLAS DE CÓDIGO OBLIGATORIAS:
1. SERVICIOS (web/src/services/): Cada método debe retornar explícitamente `new Promise((resolve, reject) => { ... })` resolviendo `response.data` y rechazando el error.
2. ESTADOS DE UI (RT-F06): Toda página que cargue datos debe implementar StatusFeedback con estados de Loading, Error y Empty State.
3. ESTILO Y UX: Interfaz limpia, accesible, con contraste WCAG, mensajes toast/alertas claras y diseño responsivo móvil-escritorio.

### PLAN DE EJECUCIÓN (Ejecuta en 2 Pasos Consecutivos):

#### PASO 1 — Base, Configuración, Contexto y Flujo Estudiante:
1. Generar `web/package.json`, `web/vite.config.js`, `web/index.html`, `web/Dockerfile`, `web/nginx.conf` y configuración de Tailwind CSS.
2. Crear `axiosClient.js` con baseURL `import.meta.env.VITE_API_URL || 'http://localhost:3000/api'`, interceptor para adjuntar token JWT y gestión de expiración 401 con `navigationRef.js`.
3. Crear `AuthContext.jsx` persistiendo token y usuario en `localStorage`, exponiendo `{ user, token, isLoggedIn, login, logout, updateUser }` y el hook `useAuth.js`.
4. Crear componentes base reutilizables: `Navbar.jsx` (con selector de roles y menú móvil), `Button.jsx`, `FormInput.jsx`, `StatusFeedback.jsx`, `Pagination.jsx`.
5. Implementar servicios: `AuthService.js`, `UserService.js`, `CursoService.js`, `InscripcionService.js`.
6. Configurar el Router en `RouterConfig.jsx` con rutas protegidas (`AuthenticatedRoute.jsx` y `RoleRoute.jsx`).
7. Desarrollar las páginas:
   - `FormLogin.jsx` y `FormRegistro.jsx` con validación Zod.
   - `PerfilPage.jsx` para ver y editar datos del usuario.
   - `CatalogoList.jsx` con filtros interactivos (búsqueda por texto, categoría, nivel) y paginación.
   - `CursoDetalle.jsx` con descripción, temario ordenado y botón para inscribirse (con feedback si ya está inscrito).
   - `MisCursosList.jsx` para el estudiante, mostrando cursos inscritos con su % de avance.
   - `LeccionView.jsx` y `CuestionarioView.jsx` con validación de lección bloqueada (RN-01), contador de intentos restantes (máximo 3, RN-03) y calificación en tiempo real sin exponer respuestas (RN-02).

#### PASO 2 — Flujo del Instructor, Panel Analítico y Cierre:
1. Implementar servicios: `LeccionService.js`, `PreguntaService.js`, `InstructorService.js`.
2. Desarrollar las pantallas de instructor:
   - `InstructorCursosList.jsx`: Listado de cursos del docente con tarjetas o tabla, contadores de lecciones/inscritos, cambio directo de estado (publicar/archivar con validación de $\ge 1$ lección RN-05) y eliminar curso (con bloqueo si tiene alumnos RN-06).
   - `EditorCurso.jsx`: Formulario de edición del curso y lista de lecciones con capacidad de reordenarlas usando botones de subida/bajada ($\uparrow / \downarrow$) o arrastre HTML5 (RF-09, RN-07).
   - `EditorLeccion.jsx`: Edición de lecciones de contenido (texto/video) o cuestionarios con modal o panel para crear, editar y eliminar preguntas con sus opciones.
   - `PanelCurso.jsx` (RF-16): Visualización gráfica del embudo de avance de estudiantes por lección, promedio de notas y cuadro destacado de "Mayor caída" mostrando dónde se detienen los alumnos.
3. Actualizar `docker-compose.yml` en la raíz para incluir el servicio `web` mapeando el puerto `5173:80`.
4. Verificar que `npm run build` en `web/` compile sin advertencias ni errores de sintaxis.

Por favor, comienza ejecutando el PASO 1 de inmediato.
```

---

## 5. ACTUALIZACIÓN DEL DOCKER-COMPOSE PARA FRONTEND

Cuando el frontend esté creado, el servicio `web` en `docker-compose.yml` debe quedar configurado de la siguiente manera:

```yaml
  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    container_name: miniaula-web
    restart: unless-stopped
    depends_on:
      - api
    ports:
      - "5173:80"
    environment:
      - VITE_API_URL=http://localhost:3000/api
```

---
*Documento generado y archivado en `c:\Users\Alejandro\Desktop\Backend_miniAula\HANDOFF_FRONTEND.md` para continuidad fluida del proyecto.*
