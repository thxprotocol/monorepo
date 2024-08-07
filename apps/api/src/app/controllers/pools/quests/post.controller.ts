import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import QuestService from '@thxnetwork/api/services/QuestService';

const validation = [
    param('id').isMongoId(),
    body('quests')
        .isString()
        .customSanitizer((quests) => JSON.parse(quests)),
];

const controller = async (req: Request, res: Response) => {
    await Promise.all(
        req.body.quests.map(async ({ variant, questId }, index) => {
            const quest = await QuestService.findById(variant, questId);
            await quest.updateOne({ index });
        }),
    );

    res.end();
};

export { controller, validation };
