import { Request, Response } from 'express';
import { Identity } from '@thxnetwork/api/models/Identity';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await Identity.findByIdAndDelete(req.params.id);
    res.status(204).end();
};

export { controller, validation };
