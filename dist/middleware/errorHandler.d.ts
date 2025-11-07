import { Request, Response, NextFunction } from 'express';
export interface ApiError extends Error {
    statusCode?: number;
}
/**
 * Global error handling middleware
 */
export declare function errorHandler(err: ApiError, req: Request, res: Response, next: NextFunction): void;
/**
 * 404 Not Found handler
 */
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=errorHandler.d.ts.map