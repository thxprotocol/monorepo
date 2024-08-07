import { param, query } from 'express-validator';
import { Request, Response } from 'express';
import {
    QuestInvite,
    QuestSocial,
    QuestCustom,
    QuestWeb3,
    QuestGitcoin,
    QuestDaily,
    QuestWebhook,
} from '@thxnetwork/api/models';
import { PipelineStage } from 'mongoose';

const validation = [
    param('id').isMongoId(),
    query('page').optional().isInt(),
    query('limit').optional().isInt(),
    query('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => {
            return value && JSON.parse(value);
        }),
];

const controller = async (req: Request, res: Response) => {
    const poolId = req.params.id;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const $match = { poolId };
    if (typeof req.query.isPublished !== 'undefined') {
        $match['isPublished'] = req.query.isPublished;
    }
    // Build the aggregation pipeline
    const pipeline: PipelineStage[] = [
        { $unionWith: { coll: QuestInvite.collection.name } },
        { $unionWith: { coll: QuestSocial.collection.name } },
        { $unionWith: { coll: QuestCustom.collection.name } },
        { $unionWith: { coll: QuestWeb3.collection.name } },
        { $unionWith: { coll: QuestGitcoin.collection.name } },
        { $unionWith: { coll: QuestWebhook.collection.name } },
        { $match },
        { $sort: { createdAt: -1 } },
    ];
    if (page) {
        pipeline.push({ $skip: (page - 1) * limit });
    }
    if (limit) {
        pipeline.push({ $limit: limit });
    }
    const results = await QuestDaily.aggregate(pipeline);

    // Count the total of quest documents
    const arr = await Promise.all(
        [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin, QuestWebhook].map(
            async (model) => await model.countDocuments($match),
        ),
    );
    const total = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    res.json({
        total,
        limit,
        page,
        results,
    });
};

export { controller, validation };
