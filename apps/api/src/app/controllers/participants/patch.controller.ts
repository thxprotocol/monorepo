import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { QuestInviteCode } from '@thxnetwork/api/models';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '@thxnetwork/api/util/logger';

const validation = [
    param('id').isMongoId(),
    body('inviteCode').optional().isString(),
    body('isSubscribed').optional().isBoolean(),
    body('email').optional().isEmail(),
];

const controller = async (req: Request, res: Response) => {
    const participant = await Participant.findById(req.params.id);
    if (!participant) throw new NotFoundError('Participant not found.');
    if (participant.sub !== req.auth.sub) throw new ForbiddenError('You are not allowed to update this participant.');

    // Add inviteCode to participant if it is not already set
    if (req.body.inviteCode && !participant.inviteCode) {
        // Fetch invite codes for logged in user
        const codes = await QuestInviteCode.find({ sub: req.auth.sub });

        // Skip if current code is owned by the logged in user
        const code = codes.find((code) => code.code === req.body.inviteCode);
        if (!code) {
            await participant.updateOne({ inviteCode: req.body.inviteCode });
        }
    }

    const account = await AccountProxy.findById(req.auth.sub);

    // If subscribed is true and email we set the participant flag to true and patch the account
    if ([true, false].includes(req.body.isSubscribed)) {
        if (account.email !== req.body.email) {
            try {
                await AccountProxy.update(req.auth.sub, { email: req.body.email } as TAccount);
            } catch (error) {
                logger.error(`Failed to update account email ${req.body.email}`, error);
            }
        }
        await participant.updateOne({ isSubscribed: req.body.isSubscribed });
    }

    res.status(204).end();
};

export { controller, validation };
