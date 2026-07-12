import { Document, FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { IBaseRepository } from '../repositories/baseRepository';

export class BaseService<T extends Document> {
  protected repository: IBaseRepository<T>;

  constructor(repository: IBaseRepository<T>) {
    this.repository = repository;
  }

  async create(item: any): Promise<T> {
    return this.repository.create(item);
  }

  async getById(id: string): Promise<T | null> {
    return this.repository.findById(id);
  }

  async getAll(filter: FilterQuery<T> = {}, options?: QueryOptions): Promise<T[]> {
    return this.repository.find(filter, options);
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.repository.update(id, update);
  }

  async delete(id: string): Promise<T | null> {
    return this.repository.delete(id);
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.repository.count(filter);
  }
}
