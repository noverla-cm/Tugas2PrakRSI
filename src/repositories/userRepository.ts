import { eq } from 'drizzle-orm';
import { getDb } from '../db/index.ts';
import { users } from '../db/schema.ts';

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'owner' | 'customer';
}

export class UserRepository {
  async findAll() {
    const db = await getDb();
    return db.select().from(users);
  }

  async findById(id: number) {
    const db = await getDb();
    const rows = await db.select().from(users).where(eq(users.id, id));
    return rows[0];
  }

  
async findByEmail(email: string) {
  const db = await getDb();
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  return rows[0];
}

  async create(input: CreateUserInput) {
    const db = await getDb();
    const rows = await db.insert(users).output().values(input);
    return rows[0];
  }
}
