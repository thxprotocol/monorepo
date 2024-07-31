import { Request, Response } from 'express';
import { IOAuthService, serviceMap } from '@thxnetwork/api/services/interfaces/IOAuthService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { OAuthScope } from '@thxnetwork/common/enums';

const validation = [];

async function controller(req: Request, res: Response) {
    const service = serviceMap[req.params.kind] as IOAuthService;
    if (!service) throw new NotFoundError(`Service not found for ${req.params.kind}`);

    const scopes = String(req.query.scopes).split(',') as OAuthScope[];
    if (!scopes || !scopes.length) throw new NotFoundError(`No scopes provided for ${req.params.kind}`);

    const url = service.getLoginURL({ uid: req.auth.sub, scopes });
    if (!url) throw new NotFoundError(`Authorize URL not created for ${req.params.kind}`);

    res.json({ url });
}

export default { validation, controller };
