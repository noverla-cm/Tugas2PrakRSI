
import express, { type Request, type Response, type Application } from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './docs/swagger-output.json' with { type: 'json' };
import { getDb } from './db/index.ts';

import { userRouter } from './routes/userRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { menuItemRouter } from './routes/menuItemRouter.ts';
import { reviewRouter } from './routes/reviewRouter.ts';
import { likeRouter } from './routes/likeRouter.ts';
import { flagRouter } from './routes/flagRouter.ts';
import { auditLogRouter } from './routes/auditLogRouter.ts';
import { authRouter } from './routes/authRouter.ts';

import { errorHandler } from './middlewares/errorHandler.ts';

const app: Application = express();
const PORT: number = 3000;

app.use(express.json());

// Dokumentasi Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1 AS ok`);

    res.status(200).json({
      status: 'success',
      message: 'Server dan database terhubung',
    });
  } catch (error) {
    // Detail error hanya di log server, tidak dikirim ke klien.
    console.error(error);
    res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke database',
    });
  }
});

// Semua router API
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/stalls', stallRouter);
app.use('/api/v1/menu-items', menuItemRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/flags', flagRouter);
app.use('/api/v1/audit-logs', auditLogRouter);

// Error handler harus setelah semua route
app.use(errorHandler);


 // #swagger.start
 /*
  #swagger.path = '/api/v1/auth/register'
  #swagger.method = 'post'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Registrasi pengguna baru'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      name: 'Nama Pengguna',
      email: 'pengguna@student.test',
      password: 'Password123'
    }
  }
  #swagger.responses[201] = { description: 'Registrasi berhasil' }
  #swagger.responses[400] = { description: 'Validasi gagal' }
  #swagger.responses[409] = { description: 'Email sudah terdaftar' }
 */
 // #swagger.end

 // #swagger.start
 /*
  #swagger.path = '/api/v1/auth/login'
  #swagger.method = 'post'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Login pengguna'
  #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      email: 'pengguna@student.test',
      password: 'Password123'
    }
  }
  #swagger.responses[200] = { description: 'Login berhasil dan token diberikan' }
  #swagger.responses[400] = { description: 'Validasi gagal' }
  #swagger.responses[401] = { description: 'Email atau password salah' }
 */
 // #swagger.end

 // #swagger.start
 /*
  #swagger.path = '/api/v1/auth/me'
  #swagger.method = 'get'
  #swagger.tags = ['Auth']
  #swagger.summary = 'Melihat profil pengguna yang login'
  #swagger.responses[200] = { description: 'Profil pengguna berhasil diambil' }
  #swagger.responses[401] = { description: 'Token tidak valid atau tidak diberikan' }
 */
 // #swagger.end

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
