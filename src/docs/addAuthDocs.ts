
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('src/docs/swagger-output.json');
const swagger = JSON.parse(fs.readFileSync(filePath, 'utf8'));

swagger.paths = swagger.paths ?? {};

swagger.paths['/api/v1/auth/register'] = {
  post: {
    tags: ['Auth'],
    summary: 'Registrasi pengguna baru',
    consumes: ['application/json'],
    parameters: [{
      in: 'body',
      name: 'body',
      required: true,
      schema: { $ref: '#/definitions/RegisterInput' },
    }],
    responses: {
      201: { description: 'Registrasi berhasil' },
      400: { description: 'Validasi gagal' },
      409: { description: 'Email sudah terdaftar' },
    },
  },
};

swagger.paths['/api/v1/auth/login'] = {
  post: {
    tags: ['Auth'],
    summary: 'Login pengguna',
    consumes: ['application/json'],
    parameters: [{
      in: 'body',
      name: 'body',
      required: true,
      schema: { $ref: '#/definitions/LoginInput' },
    }],
    responses: {
      200: { description: 'Login berhasil dan token diberikan' },
      400: { description: 'Validasi gagal' },
      401: { description: 'Email atau password salah' },
    },
  },
};

swagger.paths['/api/v1/auth/me'] = {
  get: {
    tags: ['Auth'],
    summary: 'Melihat profil pengguna yang login',
    security: [{ BearerAuth: [] }],
    responses: {
      200: { description: 'Profil pengguna berhasil diambil' },
      401: { description: 'Token tidak valid atau tidak diberikan' },
    },
  },
};

// Menambahkan parameter query untuk GET /stalls.
const stallsPath = '/api/v1/stalls/';

if (swagger.paths[stallsPath]?.get) {
  swagger.paths[stallsPath].get.parameters = [
    {
      name: 'search',
      in: 'query',
      required: false,
      type: 'string',
      description: 'Kata kunci pencarian nama warung',
    },
    {
      name: 'category',
      in: 'query',
      required: false,
      type: 'string',
      description: 'Filter berdasarkan kategori warung',
    },
    {
      name: 'page',
      in: 'query',
      required: false,
      type: 'integer',
      description: 'Nomor halaman, minimal 1',
      default: 1,
    },
    {
      name: 'limit',
      in: 'query',
      required: false,
      type: 'integer',
      description: 'Jumlah data per halaman, minimal 1 dan maksimal 100',
      default: 10,
    },
  ];
} else {
  console.warn(
    `Endpoint ${stallsPath} tidak ditemukan. Periksa path GET /stalls di swagger-output.json.`
  );
}


const stallsPostPath = '/api/v1/stalls/';

if (swagger.paths[stallsPostPath]?.post) {
  // Aktifkan kembali security JWT.
  swagger.paths[stallsPostPath].post.security = [
    { BearerAuth: [] },
  ];

  // Tetap gunakan body JSON tanpa parameter Authorization manual.
  swagger.paths[stallsPostPath].post.consumes = [
    'application/json',
  ];

  swagger.paths[stallsPostPath].post.parameters = [
    {
      name: 'body',
      in: 'body',
      required: true,
      description: 'Data warung yang akan dibuat. ownerId tidak dikirim: diambil dari token JWT.',
      schema: {
        $ref: '#/definitions/StallInput',
      },
    },
  ];

  swagger.paths[stallsPostPath].post.responses = {
    ...swagger.paths[stallsPostPath].post.responses,
    201: { description: 'Warung berhasil dibuat' },
    400: { description: 'Validasi gagal' },
    401: { description: 'Token tidak valid atau tidak diberikan' },
    403: { description: 'Role tidak memiliki izin' },
  };
}


const stallsPutPath = '/api/v1/stalls/{id}';

if (swagger.paths[stallsPutPath]?.put) {
  swagger.paths[stallsPutPath].put.security = [
    { BearerAuth: [] },
  ];

  swagger.paths[stallsPutPath].put.parameters = [
    {
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID warung yang akan diubah',
    },
    {
      name: 'body',
      in: 'body',
      required: true,
      description: 'Data warung yang akan diubah (semua field opsional)',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'Diubah owner2',
          },
          category: {
            type: 'string',
            example: 'Nasi',
          },
          location: {
            type: 'string',
            example: 'Kantin FK',
          },
          description: {
            type: 'string',
            example: 'Deskripsi baru',
          },
        },
      },
    },
  ];
}


const stallsDeletePath = '/api/v1/stalls/{id}';

if (swagger.paths[stallsDeletePath]?.delete) {
  swagger.paths[stallsDeletePath].delete.security = [
    { BearerAuth: [] },
  ];

  swagger.paths[stallsDeletePath].delete.parameters = [
    {
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID warung yang akan dihapus',
    },
  ];
}


// POST /api/v1/stalls/{id}/reviews
const stallReviewPostPath = '/api/v1/stalls/{id}/reviews';

const reviewPath = swagger.paths[stallReviewPostPath];

if (reviewPath?.post) {
  const reviewPost = reviewPath.post;

  // Autentikasi menggunakan tombol Authorize di Swagger
  reviewPost.security = [{ BearerAuth: [] }];

  // Hanya menampilkan ID warung dan body review.
  // Parameter Authorization manual dihapus dari daftar parameter.
  reviewPost.parameters = [
    {
      name: 'id',
      in: 'path',
      required: true,
      type: 'string',
      description: 'ID warung yang akan diberi review',
    },
    {
      name: 'body',
      in: 'body',
      required: true,
      description: 'Data review warung',
      schema: {
        type: 'object',
        properties: {
          rating: {
            type: 'integer',
            example: 5,
          },
          comment: {
            type: 'string',
            example: 'Pelayanan bagus dan cepat',
          },
        },
        required: ['rating'],
      },
    },
  ];

  reviewPost.consumes = ['application/json'];

  console.log('Dokumentasi POST reviews berhasil diperbarui.');
} else {
  console.warn(
    'Endpoint POST /api/v1/stalls/{id}/reviews tidak ditemukan.'
  );
}

fs.writeFileSync(filePath, JSON.stringify(swagger, null, 2));
console.log('Dokumentasi Swagger berhasil diperbarui.');

fs.writeFileSync(filePath, JSON.stringify(swagger, null, 2));

console.log('Dokumentasi endpoint Auth berhasil ditambahkan.');
