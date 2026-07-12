import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: any;
  };
}

export class ResponseHandler {
  static success<T = any>(
    res: Response,
    data?: T,
    message: string = 'Operation successful',
    statusCode: number = 200,
    meta?: any
  ): Response {
    const responseBody: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta
    };
    return res.status(statusCode).json(responseBody);
  }

  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    errors: any[] = []
  ): Response {
    const responseBody: ApiResponse = {
      success: false,
      message,
      errors
    };
    return res.status(statusCode).json(responseBody);
  }
}
