import { LikeRepository, type CreateLikeInput } from '../repositories/likeRepository.ts';
import { ReviewRepository } from '../repositories/reviewRepository.ts';
import type { LikeResponseDto } from '../dtos/likeDto.ts';

type UserRole = 'admin' | 'owner' | 'customer';

export class LikeService {
  constructor(
    private likeRepository: LikeRepository = new LikeRepository(),
    private reviewRepository: ReviewRepository = new ReviewRepository(),
  ) {}

  private toDto(row: any): LikeResponseDto {
    return {
      id: row.id,
      reviewId: row.reviewId,
      userId: row.userId,
      createdAt: row.createdAt,
    };
  }

  async createLike(input: CreateLikeInput): Promise<LikeResponseDto> {
    const review = await this.reviewRepository.findById(input.reviewId);
    if (!review) throw new Error('REVIEW_NOT_FOUND');

    const row = await this.likeRepository.create(input);
    if (!row) throw new Error('LIKE_NOT_FOUND');
    return this.toDto(row);
  }

  // Admin boleh menghapus like apa pun; pengguna lain hanya like miliknya sendiri.
  async deleteLike(id: number, userId: number, role: UserRole): Promise<LikeResponseDto> {
    const existing = await this.likeRepository.findById(id);
    if (!existing) throw new Error('LIKE_NOT_FOUND');

    if (role !== 'admin' && existing.userId !== userId) {
      throw new Error('FORBIDDEN_LIKE_ACCESS');
    }

    const row = await this.likeRepository.remove(id);
    if (!row) throw new Error('LIKE_NOT_FOUND');
    return this.toDto(row);
  }
}
