import { Model, FilterQuery, UpdateQuery } from 'mongoose';

export class BaseRepository<T> {
  protected readonly model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const record = new this.model(data);
    return record.save() as any;
  }

  async findById(id: string, select?: string, populate?: any): Promise<T | null> {
    let query: any = this.model.findById(id);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, select?: string, populate?: any): Promise<T | null> {
    let query: any = this.model.findOne(filter);
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    return query.exec();
  }

  async find(
    filter: FilterQuery<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: any;
      populate?: any;
      select?: string;
    } = {}
  ): Promise<{ data: T[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    let query: any = this.model.find(filter).skip(skip).limit(limit).lean();

    if (options.sort) query = query.sort(options.sort);
    if (options.select) query = query.select(options.select);
    if (options.populate) query = query.populate(options.populate);

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return { data, total };
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec() as any;
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec() as any;
  }
}
