import {
    AUTH_URL,
    NODE_ENV,
    CYPRESS_EMAIL,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    API_URL,
} from '@thxnetwork/api/config/secrets';
import path from 'path';
import { assetsPath } from '../util/path';
import ejs from 'ejs';
import { sendMail } from '@thxnetwork/common/mail';
import { logger } from '../util/logger';
import { AccountDocument } from '../models';
import TokenService from './TokenService';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import { v4 } from 'uuid';

const mailTemplatePath = path.join(assetsPath, 'views', 'email');

class MailService {
    async send(to: string, subject: string, htmlContent: string, link = { src: '', text: '' }) {
        if (!to) {
            logger.error({ message: 'No recipient e-mail address provided', subject });
            return;
        }

        const html = await ejs.renderFile(
            path.join(mailTemplatePath, 'base-template.ejs'),
            { link, subject, htmlContent, baseUrl: AUTH_URL },
            { async: true },
        );

        if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || NODE_ENV === 'test' || CYPRESS_EMAIL === to) {
            logger.debug({ message: 'Not sending e-mail', link });
            return;
        }

        return sendMail(to, subject, html);
    }

    async sendEmailConfirmation(account: AccountDocument, email: string) {
        const accessToken = v4();
        console.log(accessToken);

        const token = await TokenService.set({
            kind: AccessTokenKind.VerifyEmail,
            accessToken,
            expiry: Date.now() + 1000 * 60 * 60 * 24, // 24 hours from now,
            sub: account.sub,
        });
        console.log(token);

        const verifyURL = new URL(API_URL);
        verifyURL.pathname = '/v1/account/email/confirm';
        verifyURL.searchParams.append('token', token.accessTokenEncrypted);

        this.send(
            email,
            'Confirm your e-mail',
            `<p>Hi!👋</p><p>Please follow this link to confirm your e-mail address.</p>`,
            {
                src: verifyURL.toString(),
                text: 'Verify Email',
            },
        );
    }
}

export default new MailService();
