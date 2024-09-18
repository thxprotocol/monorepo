import { QRCodeEntry } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findById(req.params.id);
    if (!entry) throw new NotFoundError('QR Code Entry not found');
    if (entry.accountId !== req.auth.sub) throw new ForbiddenError('Not allowed for delete.');

    await entry.deleteOne();

    res.status(204).end();
};

export { controller, validation };
