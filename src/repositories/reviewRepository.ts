import { eq, sql } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, users, likes, flags, stalls } from '../db/schema.ts';

export interface CreateReviewInput {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
}

// Mengunci baris warung (serialisasi review yang masuk bersamaan pada warung yang sama),
// lalu menghitung ulang avg_rating dan review_count dari tabel REVIEWS.
// Wajib dipanggil di dalam transaksi yang sama dengan perubahan review.
// `tx` bertipe any karena tipe transaksi Drizzle bersifat generik dan panjang.
async function lockStall(tx: any, stallId: number) {
  await tx
    .update(stalls)
    .set({ reviewCount: sql`${stalls.reviewCount}` })
    .where(eq(stalls.id, stallId));
}

async function recalculateStallRating(tx: any, stallId: number) {
  const ratingRows: { rating: number }[] = await tx
    .select({ rating: reviews.rating })
    .from(reviews)
    .where(eq(reviews.stallId, stallId));

  const reviewCount = ratingRows.length;
  const total = ratingRows.reduce((sum, row) => sum + Number(row.rating), 0);
  const avgRating = reviewCount === 0 ? 0 : total / reviewCount;

  await tx
    .update(stalls)
    .set({ avgRating: avgRating.toFixed(2), reviewCount })
    .where(eq(stalls.id, stallId));
}

export class ReviewRepository {
  // JOIN ke USERS supaya response ikut menampilkan nama pengulas.
  async findAllWithUser(stallId?: number) {
    const db = await getDb();
    const query = db
      .select({
        id: reviews.id,
        stallId: reviews.stallId,
        userId: reviews.userId,
        rating: reviews.rating,
        comment: reviews.comment,
        likeCount: reviews.likeCount,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id));

    return stallId ? query.where(eq(reviews.stallId, stallId)) : query;
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(reviews).where(eq(reviews.id, id));
    return rows[0];
  }

  // Menambah review dan memperbarui avg_rating + review_count warung dalam SATU transaksi.
  async create(input: CreateReviewInput) {
    const db = await getDb();

    return db.transaction(async (tx) => {
      await lockStall(tx, input.stallId);

      const rows = await tx
        .insert(reviews)
        .output()
        .values({
          stallId: input.stallId,
          userId: input.userId,
          rating: input.rating,
          comment: input.comment ?? null,
          likeCount: 0,
        });

      await recalculateStallRating(tx, input.stallId);
      return rows[0];
    });
  }

  // Menghapus review beserta likes dan flags-nya, lalu memperbarui avg_rating + review_count
  // warung, semuanya dalam SATU transaksi (tidak gagal karena foreign key, tidak setengah terhapus).
  async remove(id: number) {
    const db = await getDb();

    return db.transaction(async (tx) => {
      const existing = await tx
        .select({ id: reviews.id, stallId: reviews.stallId })
        .from(reviews)
        .where(eq(reviews.id, id));
      if (existing.length === 0) return undefined;

      const stallId = existing[0]!.stallId;
      await lockStall(tx, stallId);

      await tx.delete(likes).where(eq(likes.reviewId, id));
      await tx.delete(flags).where(eq(flags.reviewId, id));

      const rows = await tx.delete(reviews).where(eq(reviews.id, id)).output();

      await recalculateStallRating(tx, stallId);
      return rows[0];
    });
  }
}
