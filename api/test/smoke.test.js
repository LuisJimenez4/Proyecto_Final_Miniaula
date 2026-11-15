// Prueba de humo (B4-03): recorre el flujo de la defensa contra la API ya levantada (docker compose up).
// Uso: npm run smoke   (SMOKE_URL cambia la URL base; por defecto http://localhost:3000/api)
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.SMOKE_URL || 'http://localhost:3000/api';
const PASSWORD = 'password123';
const run = Date.now();
const ctx = {};

async function api(method, path, { token, body, raw } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const expectError = (res, status, code) => {
  assert.equal(res.status, status, JSON.stringify(res.body));
  assert.equal(res.body.error.code, code);
};

const login = async (email) => (await api('POST', '/auth/login', { body: { email, password: PASSWORD } })).body.token;

test('salud, formato de error y validación de params/query (RT-B04, RT-B05)', async () => {
  assert.equal((await api('GET', '/health')).status, 200);
  expectError(await api('GET', '/cursos?limit=abc'), 400, 'VALIDATION_ERROR');
  expectError(await api('GET', '/cursos/abc'), 400, 'VALIDATION_ERROR');
  expectError(await api('GET', '/ruta-que-no-existe'), 404, 'ROUTE_NOT_FOUND');
  expectError(await api('POST', '/auth/login', { raw: '{malo' , body: {} }), 400, 'INVALID_JSON');
  expectError(await api('GET', '/users/me'), 401, 'UNAUTHORIZED');
});

test('sesiones: instructores del seed y estudiante nuevo (RF-01, RF-02)', async () => {
  ctx.garcia = await login('garcia@miniaula.com');
  ctx.martinez = await login('martinez@miniaula.com');
  const email = `smoke${run}@estudiante.com`;
  const registro = await api('POST', '/auth/register', { body: { nombre: 'Smoke Test', email, password: PASSWORD, rol: 'estudiante' } });
  assert.equal(registro.status, 201);
  assert.equal(registro.body.user.passwordHash, undefined);
  expectError(await api('POST', '/auth/register', { body: { nombre: 'Smoke Test', email, password: PASSWORD, rol: 'estudiante' } }), 409, 'DUPLICATE_EMAIL');
  ctx.est = await login(email);
  ctx.otro = await login('carlos@estudiante.com');
  assert.ok(ctx.garcia && ctx.martinez && ctx.est && ctx.otro);
});

test('catálogo público: solo publicados, búsqueda q y detalle sin contenido (RF-04, RF-05, RN-05)', async () => {
  const lista = await api('GET', '/cursos?limit=50');
  assert.equal(lista.status, 200);
  assert.ok(lista.body.cursos.length >= 3);
  assert.ok(lista.body.cursos.every((c) => c.estado === 'publicado'));
  assert.equal((await api('GET', '/cursos?q=%25')).body.total, 0);
  const busqueda = await api('GET', '/cursos?q=React');
  assert.ok(busqueda.body.cursos.length >= 1 && busqueda.body.cursos.every((c) => /react/i.test(c.titulo + c.descripcion)));
  const semilla = lista.body.cursos.find((c) => c.titulo === 'JavaScript Fundamentos');
  const detalle = await api('GET', `/cursos/${semilla.id}`);
  assert.equal(detalle.status, 200);
  assert.equal(detalle.body.lecciones.length, 5);
  assert.ok(detalle.body.lecciones.every((l) => l.contenido === undefined && l.preguntas === undefined));
});

test('instructor: curso, lecciones y preguntas con sus reglas (RF-06..RF-09, RF-14, RN-05, RN-07)', async () => {
  const datos = { titulo: `Curso smoke ${run}`, descripcion: 'Curso creado por la prueba de humo', categoria: 'Pruebas', nivel: 'Básico' };
  expectError(await api('POST', '/cursos', { token: ctx.est, body: datos }), 403, 'FORBIDDEN');
  const curso = await api('POST', '/cursos', { token: ctx.garcia, body: datos });
  assert.equal(curso.status, 201);
  assert.equal(curso.body.estado, 'borrador');
  ctx.cursoId = curso.body.id;

  expectError(await api('GET', `/cursos/${ctx.cursoId}`), 404, 'COURSE_NOT_FOUND');
  assert.equal((await api('GET', `/cursos/${ctx.cursoId}`, { token: ctx.garcia })).status, 200);
  expectError(await api('PUT', `/cursos/${ctx.cursoId}`, { token: ctx.martinez, body: datos }), 403, 'FORBIDDEN_NOT_OWNER');
  expectError(await api('PATCH', `/cursos/${ctx.cursoId}/estado`, { token: ctx.garcia, body: { estado: 'publicado' } }), 422, 'COURSE_EMPTY');

  const l1 = await api('POST', `/cursos/${ctx.cursoId}/lecciones`, { token: ctx.garcia, body: { titulo: 'Lección de contenido', tipo: 'contenido', contenido: 'Texto de la lección' } });
  const l2 = await api('POST', `/cursos/${ctx.cursoId}/lecciones`, { token: ctx.garcia, body: { titulo: 'Cuestionario uno', tipo: 'cuestionario', notaMinima: 70 } });
  assert.equal(l1.status, 201);
  assert.equal(l2.body.orden, 2);
  ctx.l1 = l1.body.id;
  ctx.l2 = l2.body.id;

  expectError(await api('PATCH', `/cursos/${ctx.cursoId}/estado`, { token: ctx.garcia, body: { estado: 'publicado' } }), 422, 'QUIZ_WITHOUT_QUESTIONS');
  expectError(await api('POST', `/lecciones/${ctx.l1}/preguntas`, { token: ctx.garcia, body: { enunciado: '¿Pregunta?', opciones: ['a', 'b'], indiceCorrecto: 0 } }), 422, 'LESSON_NOT_QUIZ');
  expectError(await api('POST', `/lecciones/${ctx.l2}/preguntas`, { token: ctx.garcia, body: { enunciado: '¿Pregunta?', opciones: ['a', 'b'], indiceCorrecto: 5 } }), 400, 'VALIDATION_ERROR');

  const p1 = await api('POST', `/lecciones/${ctx.l2}/preguntas`, { token: ctx.garcia, body: { enunciado: '¿Dos más dos?', opciones: ['3', '4'], indiceCorrecto: 1 } });
  assert.equal(p1.status, 201);
  expectError(await api('PUT', `/preguntas/${p1.body.id}`, { token: ctx.garcia, body: { enunciado: '¿Dos más dos?', opciones: ['3', '4'], indiceCorrecto: 9 } }), 400, 'VALIDATION_ERROR');
  await api('POST', `/lecciones/${ctx.l2}/preguntas`, { token: ctx.garcia, body: { enunciado: '¿Tres más tres?', opciones: ['5', '6', '7'], indiceCorrecto: 1 } });

  const publicado = await api('PATCH', `/cursos/${ctx.cursoId}/estado`, { token: ctx.garcia, body: { estado: 'publicado' } });
  assert.equal(publicado.status, 200);
  assert.equal(publicado.body.estado, 'publicado');
});

test('estudiante: inscripción, bloqueo y flujo de lección (RF-10..RF-15, RN-01..RN-04, RN-08, RT-B03)', async () => {
  expectError(await api('GET', `/lecciones/${ctx.l1}`, { token: ctx.est }), 403, 'NOT_ENROLLED');
  assert.equal((await api('POST', `/cursos/${ctx.cursoId}/inscripcion`, { token: ctx.est })).status, 201);
  expectError(await api('POST', `/cursos/${ctx.cursoId}/inscripcion`, { token: ctx.est }), 409, 'ALREADY_ENROLLED');
  expectError(await api('GET', `/cursos/${ctx.cursoId}/progreso`, { token: ctx.otro }), 403, 'NOT_ENROLLED');

  expectError(await api('GET', `/lecciones/${ctx.l2}`, { token: ctx.est }), 403, 'LESSON_LOCKED');
  const progreso = await api('GET', `/cursos/${ctx.cursoId}/progreso`, { token: ctx.est });
  assert.deepEqual(progreso.body.map((l) => l.desbloqueada), [true, false]);

  assert.equal((await api('GET', `/lecciones/${ctx.l1}`, { token: ctx.est })).status, 200);
  assert.equal((await api('POST', `/lecciones/${ctx.l1}/completar`, { token: ctx.est })).status, 200);
  expectError(await api('POST', `/lecciones/${ctx.l2}/completar`, { token: ctx.est }), 422, 'LESSON_NOT_CONTENT');
  expectError(await api('POST', `/lecciones/${ctx.l1}/intentos`, { token: ctx.est, body: { respuestas: [{ preguntaId: 1, indiceSeleccionado: 0 }] } }), 422, 'LESSON_NOT_QUIZ');

  const quiz = await api('GET', `/lecciones/${ctx.l2}`, { token: ctx.est });
  assert.equal(quiz.status, 200);
  assert.equal(quiz.body.preguntas.length, 2);
  assert.ok(quiz.body.preguntas.every((p) => p.indiceCorrecto === undefined));
  ctx.preguntas = quiz.body.preguntas.map((p) => p.id);

  const mal = await api('POST', `/lecciones/${ctx.l2}/intentos`, { token: ctx.est, body: { respuestas: ctx.preguntas.map((id) => ({ preguntaId: id, indiceSeleccionado: 0 })) } });
  assert.equal(mal.body.aprobado, false);
  assert.equal(mal.body.intentos, 1);

  const repetidas = ctx.preguntas.flatMap((id) => [{ preguntaId: id, indiceSeleccionado: 0 }, { preguntaId: id, indiceSeleccionado: 0 }]);
  assert.ok((await api('POST', `/lecciones/${ctx.l2}/intentos`, { token: ctx.est, body: { respuestas: repetidas } })).body.nota <= 100);

  const bien = await api('POST', `/lecciones/${ctx.l2}/intentos`, { token: ctx.est, body: { respuestas: [{ preguntaId: ctx.preguntas[0], indiceSeleccionado: 1 }, { preguntaId: ctx.preguntas[1], indiceSeleccionado: 1 }] } });
  assert.equal(bien.body.aprobado, true);
  assert.equal(bien.body.nota, 100);
  assert.equal(bien.body.completada, true);
  expectError(await api('POST', `/lecciones/${ctx.l2}/intentos`, { token: ctx.est, body: { respuestas: [{ preguntaId: ctx.preguntas[0], indiceSeleccionado: 1 }] } }), 403, 'MAX_ATTEMPTS_REACHED');

  const mias = await api('GET', '/inscripciones/mias', { token: ctx.est });
  assert.equal(mias.body[0].progresoPorcentaje, 100);
  assert.equal(mias.body[0].completado, true);
});

test('añadir una lección reabre el curso del estudiante y el panel responde (RF-16)', async () => {
  const l3 = await api('POST', `/cursos/${ctx.cursoId}/lecciones`, { token: ctx.garcia, body: { titulo: 'Cierre del curso', tipo: 'contenido', contenido: 'Resumen final' } });
  assert.equal(l3.status, 201);
  ctx.l3 = l3.body.id;
  const mias = await api('GET', '/inscripciones/mias', { token: ctx.est });
  assert.equal(mias.body[0].completado, false);

  assert.equal((await api('POST', `/cursos/${ctx.cursoId}/inscripcion`, { token: ctx.otro })).status, 201);
  const panel = await api('GET', `/instructor/cursos/${ctx.cursoId}/resumen`, { token: ctx.garcia });
  assert.equal(panel.status, 200);
  assert.equal(panel.body.inscritos, 2);
  assert.equal(panel.body.completaron, 0);
  assert.equal(panel.body.progresoPromedio, 33);
  assert.equal(panel.body.notaPromedio, 100);
  assert.deepEqual(panel.body.avancePorLeccion.map((l) => l.llegaron), [2, 1, 1]);
  assert.equal(panel.body.leccionMayorCaida.leccionId, ctx.l2);
  assert.equal(panel.body.leccionMayorCaida.detenidos, 1);
  expectError(await api('GET', `/instructor/cursos/${ctx.cursoId}/resumen`, { token: ctx.martinez }), 403, 'FORBIDDEN_NOT_OWNER');
});

test('instructor lee su lección con respuestas; reordenar y borrar (RF-08, RF-09, RN-06)', async () => {
  const lectura = await api('GET', `/lecciones/${ctx.l2}`, { token: ctx.garcia });
  assert.equal(lectura.status, 200);
  assert.ok(lectura.body.preguntas.every((p) => typeof p.indiceCorrecto === 'number'));
  expectError(await api('GET', `/lecciones/${ctx.l2}`, { token: ctx.martinez }), 403, 'FORBIDDEN_NOT_OWNER');

  expectError(await api('PATCH', `/cursos/${ctx.cursoId}/lecciones/orden`, { token: ctx.garcia, body: { orden: [ctx.l1, ctx.l2] } }), 400, 'INVALID_LESSON_ORDER');
  expectError(await api('PATCH', `/cursos/${ctx.cursoId}/lecciones/orden`, { token: ctx.garcia, body: { orden: [ctx.l1, ctx.l1, ctx.l2] } }), 400, 'VALIDATION_ERROR');
  const orden = await api('PATCH', `/cursos/${ctx.cursoId}/lecciones/orden`, { token: ctx.garcia, body: { orden: [ctx.l3, ctx.l1, ctx.l2] } });
  assert.deepEqual(orden.body.map((l) => l.id), [ctx.l3, ctx.l1, ctx.l2]);

  assert.equal((await api('DELETE', `/lecciones/${ctx.l3}`, { token: ctx.garcia })).status, 204);
  const detalle = await api('GET', `/cursos/${ctx.cursoId}`);
  assert.deepEqual(detalle.body.lecciones.map((l) => l.orden), [1, 2]);
  assert.equal((await api('GET', '/inscripciones/mias', { token: ctx.est })).body[0].completado, true);

  expectError(await api('DELETE', `/cursos/${ctx.cursoId}`, { token: ctx.garcia }), 409, 'COURSE_HAS_STUDENTS');
  const archivado = await api('PATCH', `/cursos/${ctx.cursoId}/estado`, { token: ctx.garcia, body: { estado: 'archivado' } });
  assert.equal(archivado.body.estado, 'archivado');
  expectError(await api('GET', `/cursos/${ctx.cursoId}`), 404, 'COURSE_NOT_FOUND');
});

test('curso sin inscritos se elimina con 204; perfil PUT /users/me (RF-03, RF-06)', async () => {
  const curso = await api('POST', '/cursos', { token: ctx.garcia, body: { titulo: `Borrable ${run}`, descripcion: 'Curso para borrar en la prueba', categoria: 'Pruebas' } });
  assert.equal((await api('DELETE', `/cursos/${curso.body.id}`, { token: ctx.garcia })).status, 204);

  const perfil = await api('PUT', '/users/me', { token: ctx.est, body: { nombre: 'Smoke Editado', email: `smoke${run}@estudiante.com` } });
  assert.equal(perfil.status, 200);
  assert.equal(perfil.body.nombre, 'Smoke Editado');
  assert.equal(perfil.body.passwordHash, undefined);
  expectError(await api('PUT', '/users/me', { token: ctx.est, body: { nombre: 'Smoke', email: 'ana@estudiante.com' } }), 409, 'DUPLICATE_EMAIL');
});
