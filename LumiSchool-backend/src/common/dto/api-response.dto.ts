export class PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  meta?: PaginationMeta;

  static success<T>(
    data: T,
    message = "Success",
    meta?: PaginationMeta,
  ): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.data = data;
    response.message = message;
    if (meta) response.meta = meta;
    return response;
  }

  static error<T = null>(
    message: string,
    data: T | null = null,
  ): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = false;
    response.data = data;
    response.message = message;
    return response;
  }
}
