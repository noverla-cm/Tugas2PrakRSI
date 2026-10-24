
import {
  StallRepository,
  type CreateStallInput,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import type { StallResponseDto } from '../dtos/stallDto.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;

type StallInput = Omit<CreateStallInput, 'ownerId'>;

type UserRole = 'admin' | 'owner' | 'customer';

type CreateReviewInput = {
  rating: number;
  comment?: string | null;
};

export class StallService {
  constructor(private stallRepository: StallRepository = new StallRepository()) {}

  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);

    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);

    if (!row) throw new Error('STALL_NOT_FOUND');

    return this.toDto(row);
  }

  async createStall(
    ownerId: number,
    input: StallInput
  ): Promise<StallResponseDto> {
    const row = await this.stallRepository.create({
      ...input,
      ownerId,
    });

    if (!row) throw new Error('STALL_CREATION_FAILED');

    return this.toDto(row);
  }

  async updateStall(
    id: number,
    input: StallInput,
    userId: number,
    role: UserRole
  ): Promise<StallResponseDto> {
    const existingStall = await this.stallRepository.findById(id);

    if (!existingStall) throw new Error('STALL_NOT_FOUND');

    if (role !== 'admin' && existingStall.ownerId !== userId) {
      throw new Error('FORBIDDEN_STALL_ACCESS');
    }

    const row = await this.stallRepository.update(id, input);

    if (!row) throw new Error('STALL_NOT_FOUND');

    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);

    if (!row) throw new Error('STALL_NOT_FOUND');

    return this.toDto(row);
  }

  // Membuat review untuk warung
  async createReview(
    stallId: number,
    userId: number,
    input: CreateReviewInput
  ) {
    const stall = await this.stallRepository.findById(stallId);

    if (!stall) {
      throw new Error('STALL_NOT_FOUND');
    }

    if (
      !Number.isInteger(input.rating) ||
      input.rating < 1 ||
      input.rating > 5
    ) {
      throw new Error('INVALID_REVIEW_RATING');
    }

    return this.stallRepository.createReview(stallId, userId, input);
  }
}
