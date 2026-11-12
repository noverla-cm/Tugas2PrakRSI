
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Review Kantin API - Tugas 3',
    version: '1.0.0',
  },
  servers: [{ url: 'http://localhost:3000' }],

  // Konfigurasi autentikasi JWT untuk Swagger UI
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Masukkan token dengan format: Bearer TOKEN_KAMU',
    },
  },

  definitions: {
    RegisterInput: {
      $name: 'Nama Pengguna',
      $email: 'pengguna@student.test',
      $password: 'Password123',
    },
    LoginInput: {
      $email: 'pengguna@student.test',
      $password: 'Password123',
    },
    UserInput: {
      $name: 'Bagas Pratama',
      $email: 'bagas2@student.test',
      $passwordHash: 'hash_contoh',
      $role: 'customer',
    },
    StallInput: {
      $name: 'Warung Baru',
      category: 'Nasi',
      location: 'Kantin FK',
      description: '',
    },
    MenuItemInput: {
      $stallId: 1,
      $name: 'Menu Baru',
      $price: 15000,
      isAvailable: true,
    },
    ReviewInput: {
      $stallId: 1,
      $rating: 5,
      comment: 'Enak banget',
    },
    LikeInput: {
      $reviewId: 1,
    },
    FlagStatusInput: {
      $status: 'resolved',
    },
    AuditLogInput: {
      $action: 'CREATE',
      $targetTable: 'STALLS',
      $targetId: 1,
      metadata: '{}',
    },
  },
};

const outputFile = './src/docs/swagger-output.json';

// File utama yang berisi pemasangan semua router
const endpointsFiles = ['./src/index.ts'];

const generateSwagger = swaggerAutogen();

generateSwagger(outputFile, endpointsFiles, doc).then(() => {
  console.log('Dokumentasi Swagger berhasil dibuat.');
});
