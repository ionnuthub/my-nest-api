import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(request: Request, response: Response, next: NextFunction) {
    const startTime = Date.now();

    response.on('finish', () => {
      const duration = Date.now() - startTime;

      this.logger.log(
        `${request.ip} ${request.method} ${request.originalUrl} ${response.statusCode} ${duration}ms`,
      );
    });

    next();
  }
}
