import { query } from 'express-validator';
import { Request, Response } from 'express';
import IdentityService from '@thxnetwork/api/services/IdentityService';

const validation = [query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const identities = await IdentityService.list(req.auth.sub, page, limit);

    res.json(identities);
};

export { controller, validation };
