import { SECURE_KEY } from '@thxnetwork/api/config/secrets';
import { Token } from '@thxnetwork/api/models/Token';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { decryptString } from '@thxnetwork/api/util/decrypt';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('uuid').isString()];

const controller = async (req: Request, res: Response) => {
    const accessToken = decryptString(req.query.uuid, SECURE_KEY);
    const token = await Token.findOne({ accessToken, kind: AccessTokenKind.VerifyEmail });
    if (!token) throw new NotFoundError('Token not found');

    const account = await AccountProxy.findById(token.sub);
    if (!account) throw new NotFoundError('Account not found');

    await AccountProxy.update(account.sub, { isEmailVerified: true });

    res.redirect(301, req.query.redirect as string);
};

export default { controller, validation };
