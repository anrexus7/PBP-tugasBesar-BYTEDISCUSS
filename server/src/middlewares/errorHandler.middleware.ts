import { Request, Response, NextFunction } from "express";

// Custom error class with status code
export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export function errorHandlerMiddleware(
  error: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Handle custom ApiError
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Handle unexpected errors (keep original message from controller)
  res.status(500).json({ 
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
}