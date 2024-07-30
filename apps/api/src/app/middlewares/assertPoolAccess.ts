import { Response, Request, NextFunction } from 'express';
import { ForbiddenError, SubjectUnauthorizedError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

export async function assertPoolAccess(
    req: Request & { user: { sub: string; aud: string } },
    res: Response,
    next: NextFunction,
) {
    const poolId = req.header('X-PoolId') || req.params.id; // Deprecate the header non pool child resources are tested
    if (!poolId) throw new ForbiddenError('Missing id param or X-PoolId header');

    // If there is a sub check if the user is an owner or collaborator
    const isSubjectAllowed = await PoolService.isSubjectAllowed(req.auth.sub, poolId);
    if (!isSubjectAllowed) throw new SubjectUnauthorizedError();

    next();
}
