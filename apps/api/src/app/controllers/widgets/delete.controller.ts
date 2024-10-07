import { Request, Response } from 'express';
import { Widget } from '@thxnetwork/api/models';
import { ForbiddenError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const widget = await Widget.findById(req.params.id);
    if (widget.sub !== req.auth.sub) throw new ForbiddenError();

    await widget.deleteOne();

    res.json(widget);
};

export { controller, validation };
