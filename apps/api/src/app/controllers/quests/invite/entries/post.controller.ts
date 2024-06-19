import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { JobType, agenda } from '@thxnetwork/api/util/agenda';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { QuestInvite } from '@thxnetwork/api/models';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [param('id').isMongoId(), body('recaptcha').isString()];

async function controller({ params, body, account }: Request, res: Response) {
    // Get the quest document
    const quest = await QuestInvite.findById(params.id);
    if (!quest) throw new NotFoundError('Quest not found');

    // Perhaps add current InviteURL to metadata
    const data = { metadata: {}, recaptcha: body.recaptcha };

    // Running separately to avoid issues when getting validation results from Discord interactions
    const isRealUser = await QuestService.isRealUser(quest.variant, { quest, account, data });
    if (!isRealUser.result) return res.json({ error: isRealUser.reason });

    // Get validation result for this quest entry
    const { result, reason } = await QuestService.getValidationResult(quest.variant, { quest, account, data });
    if (!result) return res.json({ error: reason });

    // Schedule serial job
    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: quest.variant,
        questId: String(quest._id),
        sub: account.sub,
        data,
    });

    res.json({ jobId: job.attrs._id });
}

export { controller, validation };
