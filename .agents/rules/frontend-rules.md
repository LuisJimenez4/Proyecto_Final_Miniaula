# Reglas del frontend (React / Vite) — MiniAula

Aplica a `web/` (todavía no existe: se crea en F0-03). Fuente: PDF del proyecto (códigos RT-F) y las convenciones
del repo de la materia (`practicareact`). Se ampliará cuando empiece la fase de frontend. Máximo 150 líneas.

## 1. Stack

React 19 + Vite · JavaScript (JSX, módulos ES) · React Router (paquete `react-router-dom` v7, como usa el código) ·
Axios · React Hook Form + Zod · Tailwind CSS. Sin TypeScript. Dependencia nueva solo con justificación.

## 2. Requisitos técnicos del PDF

| Código | Regla |
|---|---|
| RT-F01 | Rutas públicas, rutas protegidas por sesión y rutas protegidas por rol |
| RT-F02 | Context API para usuario y token; la sesión sobrevive a recargar la página |
| RT-F03 | Ningún componente llama a `fetch`/`axios` directamente; una instancia configurada adjunta el token y cierra sesión ante un 401 |
| RT-F04 | Al menos 2 hooks propios (p. ej. `useAuth`, `useFetch`, `useProgreso`) |
| RT-F05 | Validación en el cliente y muestra de los errores devueltos por la API (`error.details`) |
| RT-F06 | Toda vista con datos remotos maneja carga, error y lista vacía |
| RT-F07 | Responsivo desde 375 px, con la librería de estilos usada de forma consistente |
| RT-F08 | URL de la API en `VITE_API_URL`, nunca escrita en el código |
| RT-F09 | Dockerfile multi-etapa: compila con Vite y sirve con Nginx |

## 3. Convenciones de clase (obligatorias)

- Servicios en `src/services/`: cada función devuelve `new Promise((resolve, reject) => { ... })`,
  resuelve `response.data` y rechaza el error. Sin `async/await` dentro de los servicios.
- Una sola instancia `axiosClient` en `src/config/` con interceptor de token y de 401; los servicios usan rutas relativas.
- Navegación fuera del árbol React (401) con `navigationRef`.
- Menús de la barra con submenús (`children`) por dominio, cada uno con "listar" y "crear"; nunca enlaces sueltos.
- Textos de interfaz en español.

## 4. Pantallas mínimas

- **Estudiante:** login, registro, catálogo, detalle de curso con temario, vista de lección,
  cuestionario con resultado, mis cursos con progreso y perfil.
- **Instructor:** mis cursos, editor de curso, editor de lecciones y preguntas, y panel.

## 5. Lo que NO se hace

- Validar reglas de negocio solo en el cliente (el PDF no las cuenta como cumplidas).
- Registrar en consola contraseñas, tokens ni respuestas sensibles.
- Mostrar o pedir `indiceCorrecto` en vistas de estudiante.
