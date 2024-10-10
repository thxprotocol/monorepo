import { NextFunction, Request, Response } from 'express';
import AccountProxy from '../proxies/AccountProxy';
import { logger } from '../util/logger';

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    try {
        req.auth = await AccountProxy.findByRequest(req);
        next();
    } catch (error) {
        logger.error({ error });
        res.status(401).json({ message: 'Unauthorized' });
    }
};
