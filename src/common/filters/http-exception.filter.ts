import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that catches all unhandled exceptions
 * in the application and formats them into consistent HTTP responses.
 * 
 * This ensures all thrown errors — including unexpected system-level ones —
 * return a proper `statusCode`, `timestamp`, `path`, and `message`.
 * 
 * @credit Pattern based on NestJS’s official `ExceptionFilter` interface.
 */

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    /**
     * Core method invoked by the framework when an exception is not handled.
     * Formats the response structure for both HttpException and unknown errors.
     * 
     * @param exception The error that was thrown
     * @param host The context of the request (used to extract req/res)
     */
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Default to 500 unless it's a known HttpException
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';

        // Handle HttpExceptions gracefully by extracting their message and status
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            // Extract the message from either a string or object form
            message =
                typeof res === 'string' ? res : (res as any).message ?? message;
        }

        // Final structured error response
        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message,
        });
    }
}
