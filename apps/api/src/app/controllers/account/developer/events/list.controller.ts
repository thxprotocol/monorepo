import { Request, Response } from 'express';
import { query } from 'express-validator';
import EventService from '@thxnetwork/api/services/EventService';

const validation = [query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const events = await EventService.list(req.auth.sub, { page, limit });

    res.json(events);
};

export { controller, validation };
