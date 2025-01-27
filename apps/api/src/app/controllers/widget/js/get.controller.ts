import { API_URL } from '@thxnetwork/api/config/secrets';
import { Widget } from '@thxnetwork/api/models/Widget';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findOne({ poolId: req.params.id });
    if (!widget) throw new NotFoundError('Widget not found.');

    const urlMap = {
        'https://api.thx.network': 'https://api.twinstory.io',
        'https://dev.api.thx.network': 'https://dev.api.twinstory.io',
    };

    res.redirect(302, `${urlMap[API_URL]}/profiles/${widget.id}.js`);
};

export { controller, validation };
