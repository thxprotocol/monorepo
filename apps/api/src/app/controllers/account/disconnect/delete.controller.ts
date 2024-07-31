import { Response, Request } from 'express';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { param } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('kind').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    await AccountProxy.disconnect(account, req.params.kind as AccessTokenKind);

    res.end();
};
export { controller, validation };
