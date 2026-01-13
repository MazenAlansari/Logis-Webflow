import type { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware
 * Catches all errors and returns appropriate JSON responses
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  
  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }
}
