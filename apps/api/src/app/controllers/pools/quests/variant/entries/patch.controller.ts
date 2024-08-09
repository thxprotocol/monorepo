import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { QuestVariant } from '@thxnetwork/common/enums';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('variant').isInt(),
    param('questId').isMongoId(),
    body('entries')
        .isString()
        .custom((value: string) => value && Array.isArray(JSON.parse(value)))
        .customSanitizer((value: string) => value && JSON.parse(value)),
];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const questId = req.params.questId as string;

    const quest = await QuestService.findById(variant, questId);
    if (!quest) throw new NotFoundError('Quest not found');

    const entries = await QuestService.updateEntries(quest, req.body.entries);

    res.json(entries);
};

export { controller, validation };
