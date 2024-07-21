import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Participant, Widget, Wallet, Event, Identity } from '@thxnetwork/api/models';
import PoolService from '@thxnetwork/api/services/PoolService';
import BrandService from '@thxnetwork/api/services/BrandService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);

    // Fetch all other campaign entities
    const [widget, brand, wallets, collaborators, owner, events, identities, subscriberCount] = await Promise.all([
        Widget.findOne({ poolId: req.params.id }),
        BrandService.get(req.params.id),
        Wallet.find({ poolId: req.params.id }),
        PoolService.findCollaborators(pool),
        PoolService.findOwner(pool),
        Event.find({ poolId: pool._id }).distinct('name'), // Seperate list (many)
        Identity.find({ poolId: pool._id }), // Seperate list (many)
        Participant.countDocuments({ poolId: req.params.id, isSubscribed: true }),
    ]);

    res.json({
        ...pool.toJSON(),
        identities,
        events,
        wallets,
        widget,
        brand,
        subscriberCount,
        owner,
        collaborators,
    });
};

export { controller, validation };
