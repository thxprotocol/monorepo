import { Request, Response } from 'express';
import { Account, Pool, QuestDaily, QuestDailyEntry } from '@thxnetwork/api/models';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import { body } from 'express-validator';

const validation = [body('inviter').isString(), body('poolId').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.auth.sub);
    if (account.inviter) {
        return res.json({ success: false, reason: 'You already have inviter.' });
    }

    // Check for daily quest completion
    const dailyQuest = await QuestDaily.findOne({ poolId: req.body.poolId });
    if (!dailyQuest) {
        return res.json({ success: false, reason: 'Daily quest not found for this campaign.' });
    }

    // Get daily quest entries for the user
    const dailyQuestEntries = await QuestDailyEntry.find({
        questId: dailyQuest._id,
        sub: account.sub,
    }).sort({ createdAt: -1 });

    // Check if user has completed 7 days of daily quests
    if (dailyQuestEntries.length < 7) {
        return res.json({
            success: false,
            reason: `You need to complete daily quests for 7 days before using a referral code. Current progress: ${dailyQuestEntries.length}/7 days.`,
        });
    }

    const inviterAccount = await Account.findOne({ referralCode: req.body.inviter });
    if (!inviterAccount) {
        return res.json({ success: false, reason: 'Invalid referral code!' });
    }

    const pool = await Pool.findById(req.body.poolId);
    const INVITEE_POINTS = 100;
    const INVITER_POINTS = 200;

    await PointBalanceService.add(pool, account, INVITEE_POINTS);
    await PointBalanceService.add(pool, inviterAccount, INVITER_POINTS);
    await account.updateOne({ inviter: req.body.inviter });

    return res.json({ success: true });
};

export default { controller, validation };
