import { and, count, eq, inArray, like, type SQL } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { stalls, reviews, menuItems, likes, flags } from '../db/schema.ts';

export interface FindAllParams {
  search?: string;
  category?: string;
  page: number;
  limit: number;
}

export interface CreateStallInput {
  ownerId: number;
  name: string;
  category?: string | null;
  location?: string | null;
  description?: string | null;
}

export class StallRepository {
  async findAll(params: FindAllParams) {
    const db = await getDb();

    const conditions: SQL[] = [];
    if (params.search) conditions.push(like(stalls.name, `%${params.search}%`));
    if (params.category) conditions.push(eq(stalls.category, params.category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const offset = (params.page - 1) * params.limit;

    // MSSQL: pagination memakai ORDER BY + OFFSET ... FETCH NEXT.
    const rows = await db
      .select()
      .from(stalls)
      .where(where)
      .orderBy(stalls.id)
      .offset(offset)
      .fetch(params.limit);

    const totals = await db.select({ total: count() }).from(stalls).where(where);

    return { rows, total: Number(totals[0]?.total ?? 0) };
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(stalls).where(eq(stalls.id, id));
    return rows[0];
  }

  async create(input: CreateStallInput) {
    const db = await getDb();
    const rows = await db
      .insert(stalls)
      .output()
      .values({
        ownerId: input.ownerId,
        name: input.name,
        category: input.category ?? null,
        location: input.location ?? null,
        description: input.description ?? null,
        avgRating: '0.00',
        reviewCount: 0,
      });
    return rows[0];
  }

  async update(id: number, input: Partial<CreateStallInput>) {
    const db = await getDb();
    const rows = await db
      .update(stalls)
      .set({
        ...(input.ownerId !== undefined ? { ownerId: input.ownerId } : {}),
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.category !== undefined ? { category: input.category } : {}),
        ...(input.location !== undefined ? { location: input.location } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      })
      .where(eq(stalls.id, id))
      .output();
    return rows[0];
  }

  // Menghapus warung beserta seluruh data terkaitnya dalam SATU transaksi:
  // likes + flags (milik review warung) -> reviews -> menu_items -> stalls.
  // Jika salah satu langkah gagal, semuanya di-rollback sehingga data tidak setengah terhapus.
  async remove(id: number) {
    const db = await getDb();

    return db.transaction(async (tx) => {
      const existing = await tx.select({ id: stalls.id }).from(stalls).where(eq(stalls.id, id));
      if (existing.length === 0) return undefined;

      const reviewRows = await tx
        .select({ id: reviews.id })
        .from(reviews)
        .where(eq(reviews.stallId, id));
      const reviewIds = reviewRows.map((r) => r.id);

      // Dipotong per 500 id agar aman dari batas jumlah parameter SQL Server.
      for (let i = 0; i < reviewIds.length; i += 500) {
        const chunk = reviewIds.slice(i, i + 500);
        await tx.delete(likes).where(inArray(likes.reviewId, chunk));
        await tx.delete(flags).where(inArray(flags.reviewId, chunk));
      }

      await tx.delete(reviews).where(eq(reviews.stallId, id));
      await tx.delete(menuItems).where(eq(menuItems.stallId, id));

      const rows = await tx.delete(stalls).where(eq(stalls.id, id)).output();
      return rows[0];
    });
  }
}
