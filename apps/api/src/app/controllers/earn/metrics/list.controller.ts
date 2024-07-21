import BalancerService from '@thxnetwork/api/services/BalancerService';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('walletId').optional().isMongoId(), query('chainId').isInt()];

const controller = async (req: Request, res: Response) => {
    const result = BalancerService.getMetrics(Number(req.query.chainId));
    res.json(result);
};

export { controller, validation };
