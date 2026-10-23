import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { homeRouter } from './routes/home.js';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

app.use('/api', homeRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Pip server listening on http://localhost:${PORT}`);
});
