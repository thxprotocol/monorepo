import { param } from 'express-validator';
import { Request, Response } from 'express';
import { Pool } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import { QuestVariant, RewardVariant } from '@thxnetwork/common/enums';
import QuestService from '@thxnetwork/api/services/QuestService';
import RewardService from '@thxnetwork/api/services/RewardService';
import { serviceMap as questServiceMap } from '@thxnetwork/api/services/interfaces/IQuestService';
import { serviceMap as rewardServiceMap } from '@thxnetwork/api/services/interfaces/IRewardService';
import { logger } from '@thxnetwork/api/util/logger';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await Pool.findById(req.params.id);
    const duplicatePool = await PoolService.deploy(req.auth.sub, `${pool.settings.title} (clone)`);

    const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
    for (const variant of questVariants) {
        const Quest = await questServiceMap[variant].models.quest;
        const quests = await Quest.find({ poolId: pool.id });

        for (const q of quests) {
            try {
                const data = q.toJSON();

                delete data._id;
                delete data._v;
                delete data.createdAt;
                delete data.updatedAt;

                await QuestService.create(variant as unknown as QuestVariant, duplicatePool.id, data);
            } catch (error) {
                logger.error(error);
                continue;
            }
        }
    }

    res.status(201).json(duplicatePool.toJSON());
};

export { controller, validation };
