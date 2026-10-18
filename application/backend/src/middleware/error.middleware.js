
import { ApiError } from "../utils/apiError.js";

export const errorHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const statusCode =
        err instanceof ApiError && Number.isInteger(err.statusCode)
            ? err.statusCode
            : 500;

    console.error("Request error:", err);

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500 && !(err instanceof ApiError)
                ? "Internal server error"
                : err.message || "Internal server error",
        data: err.data ?? null,
        error: err.error ?? []
    });
};

