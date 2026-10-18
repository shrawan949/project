
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode =
        err instanceof ApiError && err.statusCode
            ? err.statusCode
            : 500;

    return res.status(statusCode).json({
        success: false,
        message: err.message || "Internal server error",
        data: err.data ?? null,
        error: err.error ?? []
    });
};

