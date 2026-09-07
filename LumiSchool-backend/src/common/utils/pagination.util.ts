import { PaginationMeta } from "../dto/api-response.dto";
import { PaginationQueryDto } from "../dto/pagination-query.dto";

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function buildMongoosePaginationOptions(query: PaginationQueryDto): {
  skip: number;
  limit: number;
  sort: Record<string, 1 | -1>;
} {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;

  return {
    skip: (page - 1) * limit,
    limit,
    sort: { [sortBy]: sortOrder } as Record<string, 1 | -1>,
  };
}
