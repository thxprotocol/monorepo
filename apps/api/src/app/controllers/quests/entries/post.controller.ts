import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/enums';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { questInteractionVariantMap } from '@thxnetwork/common/maps/quest';
import { QuestSocial } from '@thxnetwork/api/models';

const validation = [param('variant').isString(), param('id').isMongoId(), body('recaptcha').isString()];

// Dynamically create a map from string to enum value
const stringToEnumMap = Object.keys(QuestVariant)
    .filter((key) => isNaN(Number(key))) // Filter out the reverse mapping keys
    .reduce((acc, key) => {
        acc[key.toLowerCase()] = QuestVariant[key as keyof typeof QuestVariant];
        return acc;
    }, {} as Record<string, QuestVariant>);

// Get enum variant for param string or find social variant by quest id
async function getVariantFromParams(params: { variant: string; id: string }) {
    const variant = stringToEnumMap[params.variant.toLowerCase()] as QuestVariant;
    if (typeof variant === 'undefined') {
        const quest = await QuestSocial.findById(params.id);
        return quest && questInteractionVariantMap[quest.interaction];
    }
    return variant;
}

const controller = async (req: Request, res: Response) => {
    const { params, account } = req;
    const variant = await getVariantFromParams({ variant: params.variant, id: params.id });
    if (typeof variant === 'undefined') throw new NotFoundError('Could not determine the quest variant');

    const quest = await QuestService.findById(variant, params.id);
    if (!quest) throw new NotFoundError('Could not find the quest');

    const data = await QuestService.getDataForRequest(variant, req, { quest, account });
    const validationResult = await QuestService.getValidationResult(variant, {
        quest,
        account,
        data,
    });
    if (!validationResult.result) return res.json({ error: validationResult.reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant,
        questId: quest.id,
        sub: account.sub,
        ip: data.ip,
        metadata: {
            ...data,
            ...validationResult.metadata,
        },
    });

    res.json({ jobId: job.attrs._id });
};

export { controller, validation };
