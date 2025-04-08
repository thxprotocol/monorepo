import { Request, Response, NextFunction } from 'express';
import { logger } from '../util/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    // Get the IP address
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Create a copy of the body without sensitive data
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields if any
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.apiKey;

    // Log the request details
    logger.info('API Request', {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        ip: ip,
        userAgent: req.get('user-agent'),
        body: sanitizedBody,
        query: req.query,
        params: req.params,
    });

    // Capture the response
    const originalSend = res.send;
    res.send = function (body) {
        // Log the response
        logger.info('API Response', {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.originalUrl,
            ip: ip,
            statusCode: res.statusCode,
        });

        return originalSend.call(this, body);
    };

    next();
};
