import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    if (poolId) {
        const isSubjectAllowed = await PoolService.isSubjectAllowed(req.auth.sub, poolId);
        if (!isSubjectAllowed) throw new SubjectUnauthorizedError();

        const widgets = await Widget.find({ poolId });
        res.json(widgets);
    } else {
        const widgets = await Widget.find({ sub: req.auth.sub });
        res.json(widgets);
    }
};

export { controller };
