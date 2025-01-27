import { API_URL } from '@thxnetwork/api/config/secrets';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('uuid').isUUID(4)];

const controller = async (req: Request, res: Response) => {
    const urlMap = {
        'https://api.thx.network': 'https://api.twinstory.io',
        'https://dev.api.thx.network': 'https://dev.api.twinstory.io',
    };
    const url = new URL(urlMap[API_URL]);
    url.pathname = `/entries/${req.params.uuid}/redirect`;

    res.redirect(302, url.toString());
};

export { controller, validation };
