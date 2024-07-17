import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [body('settings.title').optional().isString().trim().escape().isLength({ max: 50 })];

const controller = async (req: Request, res: Response) => {
    const { title } = req.body;
    const pool = await PoolService.deploy(req.auth.sub, title || 'My Quest Campaign');

    res.status(201).json(pool);
};

export { controller, validation };
