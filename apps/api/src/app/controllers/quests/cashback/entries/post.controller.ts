import { Request, Response } from 'express';
import { Account, Client, Identity, Pool, QuestCustom } from '@thxnetwork/api/models';
import { body, param } from 'express-validator';
import { AccountPlanType, AccountVariant, JobType, QuestVariant } from '@thxnetwork/common/enums';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';
import { QuestCashback } from '@thxnetwork/api/models/QuestCashback';
import { logger } from '@thxnetwork/api/util/logger';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { uuidV1 } from '@thxnetwork/api/util/uuid';

const validation = [
    param('id').isMongoId(),
    body('amount').isNumeric(),
    body('providerUserId').isString(),
    body('santaQuestType')
        .isString()
        .custom((value) => {
            if (value !== 'cashback' && value !== 'offerwall') {
                throw new Error('Invalid santaQuestType. It must be either "cashback" or "offerwall".');
            }
            return true;
        }),
    body('santaQuestId').isString(),
];

const controller = async (req: Request, res: Response) => {
    const secret = req.header('X-API-KEY');
    if (!secret) throw new BadRequestError('Missing X-API-KEY header');

    const client = await Client.findOne({ secret });
    if (!client) throw new NotFoundError('Could not find client for this API key');

    const { providerUserId, amount, santaQuestType, santaQuestId } = req.body;

    const account = await Account.findOne({providerUserId: providerUserId});

    if (!account) {
       const email = (providerUserId.toLowerCase() + '@santa.network');

        return await Account.create({
            plan: AccountPlanType.Lite,
            username: await AccountProxy.genName(),
            variant: AccountVariant.EmailPassword,
            providerUserId,
            email: email,
            // We can assume emails are verified in case of OTP flows
            isEmailVerified: true,
          });
    }

    const quest = await QuestCashback.findById(req.params.id);
    if (!quest) throw new NotFoundError('Quest not found.');

    const pool = await Pool.findById(quest.poolId);
    if (!pool) throw new NotFoundError('Could not find pool for client');

    const uuid = uuidV1(`${client.sub}${providerUserId}`);
    const query = { sub: client.sub, uuid, poolId: quest.poolId, accountId: account._id};
    await Identity.findOneAndUpdate({uuid}, query, { new: true, upsert: true });

    const data = {
        amount,
        santaQuestType,
        santaQuestId
    }

    const { result, reason } = await QuestService.getValidationResult(quest.variant, {
        quest,
        account,
        data,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.CashbackPlaywall,
        questId: String(quest._id),
        sub: account._id,
        data: { ...data, isClaimed: true },
    });

    res.json({ jobId: job.attrs._id });
};

export { controller, validation };
