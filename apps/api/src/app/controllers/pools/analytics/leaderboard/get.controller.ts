import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [
    param('id').isMongoId(),
    query('limit').optional().isInt(),
    query('startDate').optional().isString(),
    query('endDate').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const { startDate, endDate, limit } = req.query;

    let options;
    if (startDate && endDate && limit) {
        options = {};
        options['startDate'] = new Date(String(startDate));
        options['endDate'] = new Date(String(endDate));
        options['limit'] = Number(limit);
    }

    const result = await PoolService.getLeaderboard(pool, options);

    res.json(result);
};

export { controller, validation };
