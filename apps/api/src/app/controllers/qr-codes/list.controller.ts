import { QRCodeEntry } from '@thxnetwork/api/models';
import { Request, Response } from 'express';
import { query } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [query('limit').optional().isInt({ gt: 0 }), query('page').optional().isInt({ gt: 0 })];

const controller = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const total = await QRCodeEntry.countDocuments({ accountId: req.auth.sub });
    const entries = await QRCodeEntry.find({ accountId: req.auth.sub })
        .limit(limit)
        .skip((page - 1) * limit);
    const subs = entries.map(({ sub }) => sub);
    const accounts = await AccountProxy.find({ subs });
    const results = entries.map((entry) => {
        const account = accounts.find((account) => account.sub === entry.sub);
        return Object.assign(entry.toJSON(), { account });
    });
    const meta = {
        participantCount: await QRCodeEntry.countDocuments({ sub: { $exists: true } }),
    };

    res.json({
        total,
        limit,
        page,
        results,
        meta,
    });
};

export { controller, validation };
