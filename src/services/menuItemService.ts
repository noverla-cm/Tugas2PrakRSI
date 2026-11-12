import {
  MenuItemRepository,
  type CreateMenuItemInput,
} from '../repositories/menuItemRepository.ts';
import { StallRepository } from '../repositories/stallRepository.ts';
import type { MenuItemResponseDto } from '../dtos/menuItemDto.ts';

type UserRole = 'admin' | 'owner' | 'customer';

export interface MenuActor {
  userId: number;
  role: UserRole;
}

export class MenuItemService {
  constructor(
    private menuItemRepository: MenuItemRepository = new MenuItemRepository(),
    private stallRepository: StallRepository = new StallRepository(),
  ) {}

  private toDto(row: any): MenuItemResponseDto {
    return {
      id: row.id,
      stallId: row.stallId,
      name: row.name,
      price: row.price,
      isAvailable: Boolean(row.isAvailable),
      ...(row.stallName !== undefined ? { stallName: row.stallName } : {}),
    };
  }

  // Memastikan warung ada, lalu (khusus Owner) memastikan warung itu miliknya.
  // Admin boleh mengelola menu di semua warung.
  private async assertCanManageStall(stallId: number, actor: MenuActor): Promise<void> {
    const stall = await this.stallRepository.findById(stallId);
    if (!stall) throw new Error('STALL_NOT_FOUND');

    if (actor.role !== 'admin' && stall.ownerId !== actor.userId) {
      throw new Error('FORBIDDEN_MENU_ACCESS');
    }
  }

  async getAllMenuItems(): Promise<MenuItemResponseDto[]> {
    const rows = await this.menuItemRepository.findAllWithStall();
    return rows.map((row) => this.toDto(row));
  }

  async getMenuItemById(id: number): Promise<MenuItemResponseDto> {
    const row = await this.menuItemRepository.findById(id);
    if (!row) throw new Error('MENU_ITEM_NOT_FOUND');
    return this.toDto(row);
  }

  async createMenuItem(input: CreateMenuItemInput, actor: MenuActor): Promise<MenuItemResponseDto> {
    await this.assertCanManageStall(input.stallId, actor);

    const row = await this.menuItemRepository.create(input);
    if (!row) throw new Error('MENU_ITEM_NOT_FOUND');
    return this.toDto(row);
  }

  async updateMenuItem(
    id: number,
    input: Partial<CreateMenuItemInput>,
    actor: MenuActor,
  ): Promise<MenuItemResponseDto> {
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) throw new Error('MENU_ITEM_NOT_FOUND');

    // Owner harus memiliki warung tempat menu berada saat ini ...
    await this.assertCanManageStall(existing.stallId, actor);
    // ... dan, bila menu dipindah, juga warung tujuannya.
    if (input.stallId !== undefined && input.stallId !== existing.stallId) {
      await this.assertCanManageStall(input.stallId, actor);
    }

    const row = await this.menuItemRepository.update(id, input);
    if (!row) throw new Error('MENU_ITEM_NOT_FOUND');
    return this.toDto(row);
  }

  async deleteMenuItem(id: number, actor: MenuActor): Promise<MenuItemResponseDto> {
    const existing = await this.menuItemRepository.findById(id);
    if (!existing) throw new Error('MENU_ITEM_NOT_FOUND');

    await this.assertCanManageStall(existing.stallId, actor);

    const row = await this.menuItemRepository.remove(id);
    if (!row) throw new Error('MENU_ITEM_NOT_FOUND');
    return this.toDto(row);
  }
}
