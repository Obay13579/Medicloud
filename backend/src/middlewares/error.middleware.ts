import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends ApiError {
    constructor(resource: string = 'Resource') {
        super(404, `${resource} not found.`);
        this.name = 'NotFoundError';
    }
}

/**
 * Bad Request Error (400)
 */
export class BadRequestError extends ApiError {
    constructor(message: string = 'Bad request.') {
        super(400, message);
        this.name = 'BadRequestError';
    }
}

/**
 * Unauthorized Error (401)
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = 'Unauthorized.') {
        super(401, message);
        this.name = 'UnauthorizedError';
    }
}

/**
 * Forbidden Error (403)
 */
export class ForbiddenError extends ApiError {
    constructor(message: string = 'Access denied.') {
        super(403, message);
        this.name = 'ForbiddenError';
    }
}

/**
 * Check if error is a Zod error
 */
const isZodError = (err: unknown): err is z.ZodError => {
    return err instanceof Error && err.name === 'ZodError' && 'issues' in err;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    console.error('Error:', err);

    // Handle Zod validation errors
    if (isZodError(err)) {
        const errors = err.issues.map((issue: z.ZodIssue) => ({
            field: issue.path.join('.'),
            message: issue.message,
        }));

        res.status(400).json({
            success: false,
            error: 'Validation failed.',
            details: errors,
        });
        return;
    }

    // Handle custom API errors
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            error: err.message,
        });
        return;
    }

    // Handle Prisma errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                res.status(409).json({
                    success: false,
                    error: 'A record with this value already exists.',
                });
                return;
            case 'P2025':
                // Record not found
                res.status(404).json({
                    success: false,
                    error: 'Record not found.',
                });
                return;
            case 'P2003':
                // Foreign key constraint failed
                res.status(400).json({
                    success: false,
                    error: 'Related record not found.',
                });
                return;
            default:
                res.status(400).json({
                    success: false,
                    error: 'Database operation failed.',
                });
                return;
        }
    }

    // Handle unknown errors
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error.'
            : err.message,
    });
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
): void => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found.`,
    });
};
