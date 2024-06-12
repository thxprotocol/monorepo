import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { TwitterQuery as TwitterQueryParser } from '@thxnetwork/common/twitter';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import { agenda } from '@thxnetwork/api/util/agenda';
import { TwitterQueryService } from '@thxnetwork/api/services';

const validation = [
    param('id').isMongoId(),
    body('frequencyInHours').isInt(),
    body('operators').customSanitizer((ops) => TwitterQueryParser.parse(ops)),
];

const controller = async (req: Request, res: Response) => {
    const query = TwitterQueryParser.create(req.body.operators);

    // 512 is the max length for X API queries within the Basic plan
    if (query.length > 512) {
        throw new BadRequestError('Your query is too long! Please remove some fields.');
    }

    const twitterQuery = await TwitterQuery.create({
        poolId: req.params.id,
        frequencyInHours: req.body.frequencyInHours,
        operators: req.body.operators,
        defaults: req.body.defaults,
        query,
    });

    // Start an agenda job that runs every frequencyInHours from now
    // Will be deleted when the query is deleted
    await agenda.every(`${req.body.frequencyInHours} minutes`, twitterQuery.jobName, {
        queryId: twitterQuery.id,
    });

    // Search initial posts and create quests
    await TwitterQueryService.run([twitterQuery]);

    res.status(201).json(twitterQuery);
};

export { controller, validation };
