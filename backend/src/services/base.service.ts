import { BaseRepository } from '../repositories/base.repository';
import { AppError } from '../utils/appError';

export class BaseService<T> {
  protected readonly repository: BaseRepository<T>;
  protected readonly resourceName: string;

  constructor(repository: BaseRepository<T>, resourceName: string) {
    this.repository = repository;
    this.resourceName = resourceName;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async getById(id: string, select?: string, populate?: any): Promise<T> {
    const item = await this.repository.findById(id, select, populate);
    if (!item) {
      throw AppError.notFound(`${this.resourceName} with ID ${id} not found`);
    }
    return item;
  }

  async getAll(
    filter: any = {},
    options: { page?: number; limit?: number; sort?: any; populate?: any; select?: string } = {}
  ): Promise<{ data: T[]; total: number }> {
    return this.repository.find(filter, options);
  }

  async update(id: string, data: any): Promise<T> {
    const item = await this.repository.update(id, data);
    if (!item) {
      throw AppError.notFound(`${this.resourceName} with ID ${id} not found`);
    }
    return item;
  }

  async delete(id: string): Promise<void> {
    const item = await this.repository.delete(id);
    if (!item) {
      throw AppError.notFound(`${this.resourceName} with ID ${id} not found`);
    }
  }
}
