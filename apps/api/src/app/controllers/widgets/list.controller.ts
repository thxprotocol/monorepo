import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import { SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/common/constants';

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    if (poolId) {
        const isSubjectAllowed = await PoolService.isSubjectAllowed(req.auth.sub, poolId);
        if (!isSubjectAllowed) throw new SubjectUnauthorizedError();

        const widgets = await Widget.find({ poolId });
        res.json(widgets);
    } else {
        const widgets = await Widget.find({ sub: req.auth.sub });
        if (!widgets.length) {
            widgets.push(
                await Widget.create({
                    sub: req.auth.sub,
                    align: 'right',
                    message: 'Hi there!👋 Click me to see your collectibles...',
                    theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
                }),
            );
        }
        res.json(widgets);
    }
};

export { controller };
