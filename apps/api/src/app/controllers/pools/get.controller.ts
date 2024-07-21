import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Event, Participant, Widget, Wallet, Webhook } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);

    // Fetch all other campaign entities
    const [widget, brand, wallets, collaborators, owner, subscriberCount, eventNames, webhooks] = await Promise.all([
        Widget.findOne({ poolId: req.params.id }),
        BrandService.get(req.params.id),
        Wallet.find({ poolId: req.params.id }),
        PoolService.findCollaborators(pool),
        PoolService.findOwner(pool),
        Participant.countDocuments({ poolId: req.params.id, isSubscribed: true }),
        Event.find({ sub: pool.sub }).distinct('name'),
        Webhook.find({ sub: pool.sub }),
    ]);

    res.json({
        ...pool.toJSON(),
        wallets,
        widget,
        brand,
        subscriberCount,
        owner,
        collaborators,
        eventNames,
        webhooks,
    });
};

export { controller, validation };
