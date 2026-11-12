// Mendeteksi pelanggaran UNIQUE constraint SQL Server (error 2627 / 2601),
// termasuk bila error dibungkus (cause) oleh driver/ORM.
export function isUniqueViolation(error: unknown): boolean {
  let current: any = error;
  for (let i = 0; i < 5 && current; i += 1) {
    const number = current.number ?? current.originalError?.number;
    if (number === 2627 || number === 2601) return true;
    if (typeof current.message === 'string' && /unique (key )?constraint|duplicate key/i.test(current.message)) {
      return true;
    }
    current = current.cause;
  }
  return false;
}
