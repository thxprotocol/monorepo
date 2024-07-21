import { Request, Response } from 'express';
import { Identity } from '@thxnetwork/api/models/Identity';
import { uuidV1 } from '@thxnetwork/api/util/uuid';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const uuid = uuidV1();
    const id = await Identity.create({ sub: req.auth.sub, uuid });

    res.json(id.uuid);
};

export { controller, validation };
