
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository, type CreateUserInput } from '../repositories/userRepository.ts';
import type { UserResponseDto } from '../dtos/userDto.ts';

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date | null;
};

const JWT_SECRET = process.env.JWT_SECRET;

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET belum diatur di file .env');
  }
  return JWT_SECRET;
}

export class UserService {
  constructor(private userRepository: UserRepository = new UserRepository()) {}

  private toDto(row: UserRow): UserResponseDto {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      createdAt: row.createdAt,
    };
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    const rows = await this.userRepository.findAll();
    return rows.map((row) => this.toDto(row));
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const row = await this.userRepository.findById(id);
    if (!row) throw new Error('USER_NOT_FOUND');
    return this.toDto(row);
  }

  async createUser(input: CreateUserInput): Promise<UserResponseDto> {
    const row = await this.userRepository.create(input);
    if (!row) throw new Error('USER_NOT_FOUND');
    return this.toDto(row);
  }

  async register(input: {
    name: string;
    email: string;
    password: string;
  }) {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const row = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
    });

    if (!row) throw new Error('USER_CREATION_FAILED');

    return this.toDto(row);
  }

  async login(input: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      getJwtSecret(),
      { expiresIn: '2h' }
    );

    return {
      user: this.toDto(user),
      token,
    };
  }
}
