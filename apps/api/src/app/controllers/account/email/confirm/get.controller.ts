import { DASHBOARD_URL } from '@thxnetwork/api/config/secrets';
import { Token } from '@thxnetwork/api/models/Token';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { Request, Response } from 'express';
import { query } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [query('token').isString()];

const controller = async (req: Request, res: Response) => {
    let message = 'Confirmation failed: ';
    try {
        const token = await Token.findOne({ accessTokenEncrypted: req.query.token, kind: AccessTokenKind.VerifyEmail });
        if (!token) throw new NotFoundError('Token not found');

        const account = await AccountProxy.findById(token.sub);
        if (!account) throw new NotFoundError('Account not found');

        await AccountProxy.update(account.sub, { isEmailVerified: true });
        message = 'E-mail is confirmed!';
    } catch (error) {
        message += error.message;
    }

    const url = new URL(DASHBOARD_URL);
    url.pathname = '/confirm';
    url.searchParams.append('message', message);

    res.redirect(301, url.toString());
};

export default { controller, validation };
