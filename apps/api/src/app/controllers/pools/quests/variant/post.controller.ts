import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { ChainId } from '@thxnetwork/common/enums';
import { isAddress } from 'web3-utils';
import { defaults } from '@thxnetwork/api/util/validation';
import QuestService from '@thxnetwork/api/services/QuestService';

const validationBaseQuest = [
    param('id').isMongoId(),
    ...defaults.quest,
    // Daily
    body('amounts')
        .optional()
        .custom((amounts) => {
            for (const amount of JSON.parse(amounts)) {
                if (isNaN(amount)) return false;
            }
            return true;
        })
        .customSanitizer((amounts) => JSON.parse(amounts)),
    body('eventName').optional().isString(),
    // Invite
    body('amountInvitee').optional().isNumeric(),
    body('requiredQuest.questId').optional().isMongoId(),
    body('requiredQuest.variant').optional().isInt(),
    body('requiredQuest')
        .optional()
        .customSanitizer((quest) => {
            return quest && JSON.parse(quest);
        }),
    // Social
    body('kind').optional().isString(),
    body('interaction').optional().isNumeric(),
    body('content').optional().isString(),
    body('contentMetadata').optional().isString(),
    // Custom
    body('limit').optional().isInt(),
    // Web3
    body('contracts')
        .optional()
        .customSanitizer((contracts) => {
            return JSON.parse(contracts).filter((contract: { address: string; chainId: ChainId }) =>
                isAddress(contract.address),
            );
        }),
    body('methodName').optional().isString(),
    body('threshold').optional().isString(),
    // Gitcoin
    //
    // Webhook
    body('metadata').optional().isString(),
    body('isAmountCustom').optional().isBoolean(),
];

const validation = [param('id').isMongoId(), ...validationBaseQuest];

const controller = async (req: Request, res: Response) => {
    const quest = await QuestService.create(req.body.variant, req.params.id, req.body, req.file);
    res.status(201).json(quest);
};

export { controller, validation };
