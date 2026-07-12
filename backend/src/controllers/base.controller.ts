import { Request, Response, NextFunction } from 'express';
import { BaseService } from '../services/base.service';
import { ResponseHandler } from '../utils/responseHandler';

export class BaseController<T> {
  protected readonly service: BaseService<T>;

  constructor(service: BaseService<T>) {
    this.service = service;
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      ResponseHandler.success(res, item, 'Created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.getById(req.params.id);
      ResponseHandler.success(res, item, 'Retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sort = req.query.sort;
      const populate = req.query.populate;
      const select = req.query.select as string;

      // Extract filter keys from query parameters except pagination ones
      const filter = { ...req.query };
      delete filter.page;
      delete filter.limit;
      delete filter.sort;
      delete filter.populate;
      delete filter.select;

      const result = await this.service.getAll(filter, { page, limit, sort, populate, select });
      ResponseHandler.success(res, result, 'Retrieved list successfully');
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.update(req.params.id, req.body);
      ResponseHandler.success(res, item, 'Updated successfully');
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      ResponseHandler.success(res, null, 'Deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
