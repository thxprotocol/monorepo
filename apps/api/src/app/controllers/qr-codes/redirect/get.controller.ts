import { Request, Response } from 'express';
import { param } from 'express-validator';
import { QRCodeEntry } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const entry = await QRCodeEntry.findOne({ uuid: req.params.uuid });
    if (!entry) throw new NotFoundError('QR Code entry not found');
    if (!entry.redirectURL) throw new NotFoundError('Redirect URL not found');

    const url = new URL(entry.redirectURL);
    url.searchParams.append('thx_widget_path', `/c/${req.params.uuid}`);

    res.redirect(302, url.toString());
};

export { controller, validation };
