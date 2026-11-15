# AGENTS.md — web/ (frontend de MiniAula)

SPA React 19 + Vite + Tailwind + react-router-dom v7 + React Hook Form + Zod + Axios. Gestor de paquetes: **pnpm**.
Reglas completas en [`../.agents/rules/frontend-rules.md`](../.agents/rules/frontend-rules.md); estado en [`../MEMORY.md`](../MEMORY.md); tareas en [`../odd/tasks/`](../odd/README.md).

## Capas (src/)
- `config/` axiosClient (único import de axios, interceptores) y session (token/usuario).
- `services/` una función por endpoint; **cada una devuelve `new Promise`** y resuelve `response.data`.
- `hooks/` useFetch (`useFetch(fn, {deps, immediate})`), useProgreso, useAuth. Las páginas no llaman axios.
- `utils/apiError.js` convierte `{error:{code,message,details}}` en mensajes y errores por campo.
- `constants/` roles, niveles, estados y códigos de error. `components/` UI reutilizable. `pages/` por rol. `routes/` rutas protegidas.

## Reglas
1. La API manda: desbloqueo, intentos, notas y publicación se calculan allí; el front muestra su respuesta.
2. Nunca leer `indiceCorrecto` en vistas de estudiante. Sin `alert()`, `window.confirm`, `console.*` ni `localhost` en `src`.
3. Toda pantalla con datos maneja carga, error con reintento y vacío (`StatusFeedback`). Responsivo desde 375px.
4. `VITE_API_URL` es obligatoria y se fija al compilar (build-arg en Docker).
5. Si la documentación y el código discrepan, seguir el código y anotar la discrepancia.

## Verificación mínima
`pnpm build` sin errores y los greps de la regla 2 sin resultados (salvo comentarios).
