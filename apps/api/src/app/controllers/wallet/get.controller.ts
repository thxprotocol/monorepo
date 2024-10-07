import { Widget } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findById(req.params.id);
    if (!widget) throw new NotFoundError('Widget not found');
    res.json(widget);
};

export default { controller, validation };
