import { Request, Response } from 'express';
import { Participant } from '@thxnetwork/api/models/Participant';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await Participant.updateMany({ poolId: req.params.id }, { balance: 0 });
    res.status(204).end();
};

export { controller, validation };
