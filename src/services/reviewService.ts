import { ReviewRepository, type CreateReviewInput } from '../repositories/reviewRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import type { ReviewResponseDto } from '../dtos/reviewDto.ts';

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository = new ReviewRepository(),
    private stallRepository: StallRepository = new StallRepository(),
  ) {}

  private toDto(row: any): ReviewResponseDto {
    return {
      id: row.id,
      stallId: row.stallId,
      userId: row.userId,
      rating: row.rating,
      comment: row.comment,
      likeCount: row.likeCount,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      ...(row.userName !== undefined ? { userName: row.userName } : {}),
    };
  }

  async getAllReviews(stallId?: number): Promise<ReviewResponseDto[]> {
    const rows = await this.reviewRepository.findAllWithUser(stallId);
    return rows.map((row) => this.toDto(row));
  }

  async createReview(input: CreateReviewInput): Promise<ReviewResponseDto> {
    const stall = await this.stallRepository.findById(input.stallId);
    if (!stall) throw new Error('STALL_NOT_FOUND');

    const row = await this.reviewRepository.create(input);
    if (!row) throw new Error('REVIEW_NOT_FOUND');
    return this.toDto(row);
  }

  async deleteReview(id: number): Promise<ReviewResponseDto> {
    const row = await this.reviewRepository.remove(id);
    if (!row) throw new Error('REVIEW_NOT_FOUND');
    return this.toDto(row);
  }
}
