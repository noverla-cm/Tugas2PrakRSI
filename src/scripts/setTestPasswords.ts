import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';

// Akun pada db/03-seed-full.sql memakai hash palsu (mis. "hash_admin") sehingga tidak bisa login.
// Skrip ini mengganti hash palsu tersebut dengan hash bcrypt dari satu password uji,
// supaya akun admin dan owner dapat dipakai untuk menguji frontend. Aman dijalankan berulang:
// hanya baris yang masih berhash palsu yang diubah.
const PASSWORD = process.env.SEED_PASSWORD || 'Password123';

async function main() {
  const db = await getDb();
  const hash = await bcrypt.hash(PASSWORD, 12);

  await db.execute(
    sql`UPDATE dbo.USERS SET password_hash = ${hash} WHERE password_hash LIKE 'hash[_]%'`
  );

  console.log('Password akun seed berhasil diatur.');
  console.log(`Password uji: ${PASSWORD}`);
  console.log('Contoh akun: admin@kantin.test (admin), tini@kantin.test (owner, warung id 1),');
  console.log('             slamet@kantin.test (owner, warung id 3), bagas@student.test (customer)');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Gagal mengatur password akun seed:', error);
    process.exit(1);
  });
