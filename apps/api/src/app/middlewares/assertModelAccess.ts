import { ForbiddenError } from '@thxnetwork/api/util/errors';

export const assertModelAccess = (Model) => async (req, res, next) => {
    const entity = await Model.findById(req.params.id);
    if (entity && entity.sub !== req.auth.sub) {
        throw new ForbiddenError("You don't have access to this entity");
    }
    next();
};
