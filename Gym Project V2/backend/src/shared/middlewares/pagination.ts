import { NextFunction, Request, Response } from "express";

interface PaginationQuery {
  limit?: string | number;
  page?: string | number;
  [key: string]: any;
}

interface PaginationResult {
  query: { [key: string]: any };
  pagination: {
    page: number;
    limit: number;
    skip: number;
  };
}

const paginationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const query: PaginationQuery = req.query;
  let { limit, page } = query;
  delete query.limit;
  delete query.page;

  if (!page) page = 1;
  if (!limit) limit = 10;

  limit = parseInt(limit as string, 10);
  page = parseInt(page as string, 10);
  const skip = page > 1 ? (page - 1) * limit : 0;

  const paginationResult: PaginationResult = {
    query,
    pagination: {
      page,
      limit,
      skip,
    },
  };

  req.query = paginationResult.query;
  req.pagination = paginationResult.pagination;
  console.log(paginationResult);
  next();
};

export default paginationMiddleware;
