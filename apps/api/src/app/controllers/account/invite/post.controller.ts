import { Request, Response } from 'express';
import { Account, Pool } from '@thxnetwork/api/models';
import PointBalanceService from '@thxnetwork/api/services/PointBalanceService';
import { body } from 'express-validator';

const validation = [body('inviter').isString(), body('poolId').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.auth.sub);
    if (account.inviter) {
        return res.json({ success: false, reason: 'You already have inviter.' });
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
