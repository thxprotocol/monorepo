import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { logger } from '@thxnetwork/api/util/logger';
import { IQuestInviteService, serviceMap } from '@thxnetwork/api/services/interfaces/IQuestService';
import { QuestVariant } from '@thxnetwork/common/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

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

    // Create invite if code is present and unused by sub
    const service = serviceMap[QuestVariant.Invite] as IQuestInviteService;
    await service.createInvitee(req.auth.sub, req.body.inviteCode);

    // If subscribed is true and email we set the participant flag to true and patch the account
    const account = await AccountProxy.findById(req.auth.sub);
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
