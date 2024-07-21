import { Request, Response } from 'express';
import { Invoice, Pool } from '@thxnetwork/api/models';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const poolIds = await Pool.find({ sub: req.auth.sub });
    const invoices = await Invoice.find({ poolId: { $in: poolIds } });

    res.json(invoices);
};

export { controller, validation };
