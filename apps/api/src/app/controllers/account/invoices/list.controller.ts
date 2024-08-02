import { Request, Response } from 'express';
import { Invoice } from '@thxnetwork/api/models';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const invoices = await Invoice.find({ sub: req.auth.sub });

    res.json(invoices);
};

export { controller, validation };
