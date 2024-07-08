import { Request, Response, NextFunction } from 'express';
import { supabase } from '../proxies/AccountProxy';
import { logger } from '../util/logger';
import expressJwtPermissions from 'express-jwt-permissions';

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data, error } = await supabase.auth.getUser(token);
        if (error) throw error;
        req.auth = data.user;
    } catch (error) {
        logger.error({ error });
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const guard: any = expressJwtPermissions({
    requestProperty: 'auth',
    permissionsProperty: 'scope',
});
