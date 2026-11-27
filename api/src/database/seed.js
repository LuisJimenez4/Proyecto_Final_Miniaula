import bcrypt from 'bcryptjs';
import { sequelize, Usuario, Curso, Leccion, Pregunta } from '../models/index.js';

const PASSWORD_DEMO = 'password123';

const USUARIOS = [
  { nombre: 'Prof. García', email: 'garcia@miniaula.com', rol: 'instructor' },
  { nombre: 'Prof. Martínez', email: 'martinez@miniaula.com', rol: 'instructor' },
  { nombre: 'Ana López', email: 'ana@estudiante.com', rol: 'estudiante' },
  { nombre: 'Carlos Ruiz', email: 'carlos@estudiante.com', rol: 'estudiante' },
  { nombre: 'María Torres', email: 'maria@estudiante.com', rol: 'estudiante' },
];

const CURSOS = [
  { titulo: 'JavaScript Fundamentos', descripcion: 'Aprende JavaScript desde cero: variables, funciones y control de flujo.', categoria: 'Programación', nivel: 'Básico', instructor: 'garcia@miniaula.com', tema: 'JavaScript' },
  { titulo: 'React Avanzado', descripcion: 'Hooks, Context y patrones de composición para aplicaciones React.', categoria: 'Programación', nivel: 'Avanzado', instructor: 'garcia@miniaula.com', tema: 'React' },
  { titulo: 'Diseño UX/UI', descripcion: 'Principios de diseño centrado en el usuario y prototipado.', categoria: 'Diseño', nivel: 'Intermedio', instructor: 'martinez@miniaula.com', tema: 'UX/UI' },
];

/** 5 lecciones por curso: contenido, cuestionario, contenido, cuestionario, contenido. */
const plantillaLecciones = (tema) => [
  { orden: 1, tipo: 'contenido', titulo: `Introducción a ${tema}`, contenido: `Bienvenido. En esta lección verás los conceptos fundamentales de ${tema}.` },
  { orden: 2, tipo: 'cuestionario', titulo: `Cuestionario 1 de ${tema}`, notaMinima: 70 },
  { orden: 3, tipo: 'contenido', titulo: `Conceptos clave de ${tema}`, contenido: `Profundizamos en los conceptos clave y las buenas prácticas de ${tema}.` },
  { orden: 4, tipo: 'cuestionario', titulo: `Cuestionario 2 de ${tema}`, notaMinima: 70 },
  { orden: 5, tipo: 'contenido', titulo: `Resumen y cierre de ${tema}`, contenido: `Repaso general de lo aprendido en ${tema}.` },
];

/** 4 preguntas por cuestionario: con 70 % de nota mínima se puede reprobar (≤2 aciertos) y aprobar (≥3). */
const plantillaPreguntas = (tema) => [
  { enunciado: `¿Cuál es el objetivo principal de ${tema}?`, opciones: ['Resolver un problema concreto', 'Decorar el sistema', 'Evitar la documentación', 'Ninguno de los anteriores'], indiceCorrecto: 0 },
  { enunciado: `¿Qué conviene hacer al empezar con ${tema}?`, opciones: ['Ignorar los fundamentos', 'Practicar con ejemplos pequeños', 'Memorizar sin entender', 'Saltarse las pruebas'], indiceCorrecto: 1 },
  { enunciado: `¿Cuál es una buena práctica en ${tema}?`, opciones: ['Duplicar código', 'Nombres confusos', 'Funciones cortas y claras', 'Sin revisión'], indiceCorrecto: 2 },
  { enunciado: `¿Cómo se valida lo aprendido en ${tema}?`, opciones: ['No se valida', 'Adivinando', 'Copiando', 'Construyendo y probando'], indiceCorrecto: 3 },
];

async function crearUsuarios(transaction) {
  const passwordHash = await bcrypt.hash(PASSWORD_DEMO, 10);
  const usuarios = await Usuario.bulkCreate(USUARIOS.map((u) => ({ ...u, passwordHash })), { transaction });
  return Object.fromEntries(usuarios.map((u) => [u.email, u]));
}

async function crearLeccionesConPreguntas(curso, tema, transaction) {
  for (const plantilla of plantillaLecciones(tema)) {
    const leccion = await Leccion.create({ ...plantilla, cursoId: curso.id }, { transaction });
    if (plantilla.tipo !== 'cuestionario') continue;
    const preguntas = plantillaPreguntas(tema).map((p) => ({ ...p, leccionId: leccion.id }));
    await Pregunta.bulkCreate(preguntas, { transaction });
  }
}

async function crearCursos(usuarios, transaction) {
  for (const { instructor, tema, ...datos } of CURSOS) {
    const curso = await Curso.create(
      { ...datos, estado: 'publicado', instructorId: usuarios[instructor].id },
      { transaction },
    );
    await crearLeccionesConPreguntas(curso, tema, transaction);
  }
}

/** RT-B08: seed idempotente; si ya existen usuarios no hace nada. */
async function seed() {
  try {
    await sequelize.authenticate();
    if ((await Usuario.count()) > 0) {
      console.log('ℹ️  Seed ya aplicado — se omite.');
      process.exit(0);
    }
    await sequelize.transaction(async (transaction) => {
      const usuarios = await crearUsuarios(transaction);
      await crearCursos(usuarios, transaction);
    });
    console.log('✅ Seed ejecutado correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  }
}

seed();
