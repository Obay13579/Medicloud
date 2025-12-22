import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
    password: string,
    hash: string
): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Get start of day in UTC
 */
export const getStartOfDay = (date: Date | string): Date => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

/**
 * Get end of day in UTC
 */
export const getEndOfDay = (date: Date | string): Date => {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 999);
    return d;
};

/**
 * Standard API response format
 */
export const apiResponse = <T>(
    success: boolean,
    data?: T,
    message?: string,
    error?: string
) => {
    return {
        success,
        ...(data !== undefined && { data }),
        ...(message && { message }),
        ...(error && { error }),
    };
};

/**
 * Pagination helper
 */
export const paginate = (page: number = 1, limit: number = 10) => {
    const skip = (page - 1) * limit;
    return {
        skip,
        take: limit,
    };
};
