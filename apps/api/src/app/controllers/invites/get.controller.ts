import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Participant, QuestInvite, QuestInviteCode } from '@thxnetwork/api/models';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import QuestService from '@thxnetwork/api/services/QuestService';
import { NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('code').isString()];

const controller = async (req: Request, res: Response) => {
    const code = await QuestInviteCode.findOne({ code: req.params.code });
    if (!code) throw new NotFoundError('Invite Link not found');

    const quest = await QuestInvite.findById(code.questId);
    if (!quest) throw new NotFoundError('Quest not found');

    const { variant, questId } = quest.requiredQuest;
    const requiredQuest = await QuestService.findById(variant, questId);
    if (!requiredQuest) throw new NotFoundError('Required Quest not found');

    const account = await AccountProxy.findById(code.sub);
    if (!account) throw new NotFoundError('Inviter account not found');

    const participant = await Participant.findOne({ poolId: quest.poolId, sub: account.sub });
    if (!participant) throw new NotFoundError('Inviter is not a campaign participant');

    res.json({
        quest,
        requiredQuest,
        code,
        account: {
            username: account.username,
            rank: participant.rank,
        },
    });
};

export { controller, validation };
