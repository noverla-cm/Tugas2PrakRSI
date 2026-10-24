import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { reviews, users } from '../db/schema.ts';

export interface CreateReviewInput {
  stallId: number;
  userId: number;
  rating: number;
  comment?: string | null;
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

  async create(input: CreateReviewInput) {
    const db = await getDb();
    const rows = await db
      .insert(reviews)
      .output()
      .values({
        stallId: input.stallId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment ?? null,
        likeCount: 0,
      });
    return rows[0];
  }

  async remove(id: number) {
    const db = await getDb();
    const rows = await db.delete(reviews).where(eq(reviews.id, id)).output();
    return rows[0];
  }
}
