import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { corsOptions } from './config/cors.config.js';
import router from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';

const app = express();

// ─── Global middlewares ──────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());

// ─── Routes ──────────────────────────────────────
app.use('/api', router);

// ─── Error handler (must be last) ────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
