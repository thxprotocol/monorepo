import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Participant, QuestInvite, QuestInviteCode } from '@thxnetwork/api/models';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import QuestService from '@thxnetwork/api/services/QuestService';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';

const validation = [param('code').isString()];

const controller = async (req: Request, res: Response) => {
    const code = await QuestInviteCode.findOne({ code: req.params.code });
    if (!code) throw new NotFoundError('Invite Link not found');

    const quest = await QuestInvite.findById(code.questId);
    if (!quest) throw new NotFoundError('Quest not found');

    const pool = await PoolService.getById(quest.poolId);
    if (!pool) throw new NotFoundError('Campaign not found');

    const { variant, questId } = quest.requiredQuest;
    const requiredQuest = await QuestService.findById(variant, questId);
    if (!requiredQuest) throw new NotFoundError('Required Quest not found');

    const account = await AccountProxy.findById(code.sub);
    if (!account) throw new NotFoundError('Inviter account not found');

    const participant = await Participant.findOne({ poolId: quest.poolId, sub: account.sub });
    if (!participant) throw new NotFoundError('Inviter is not a campaign participant');

    const brand = await BrandService.get(pool.id);

    res.json({
        quest,
        requiredQuest,
        code,
        account: {
            username: account.username,
            rank: participant.rank,
        },
        campaign: {
            id: pool.id,
            title: pool.settings.title,
            slug: pool.settings.slug,
            image: brand ? brand.backgroundImgUrl : '',
        },
    });
};

export { controller, validation };
