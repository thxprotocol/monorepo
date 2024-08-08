import { param } from 'express-validator';
import { Request, Response } from 'express';
import { QuestVariant } from '@thxnetwork/common/enums';
import QuestService from '@thxnetwork/api/services/QuestService';
import * as CreateController from '@thxnetwork/api/controllers/pools/quests/variant/post.controller';

const validation = [param('variant').isInt(), param('questId').isMongoId(), ...CreateController.validation];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as QuestVariant;
    const questId = req.params.questId as string;

    const quest = await QuestService.findById(variant, questId);
    const result = await QuestService.update(quest, req.body, req.file);

    res.json(result);
};

export { controller, validation };
