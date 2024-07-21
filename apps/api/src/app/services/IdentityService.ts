import { Identity, PoolDocument } from '@thxnetwork/api/models';
import { uuidV1 } from '../util/uuid';

export default class IdentityService {
    static getUUID(pool: PoolDocument, salt: string) {
        const poolId = String(pool._id);
        return uuidV1(`${poolId}${salt}`);
    }

    // Derive uuid v1 from poolId + salt. Using uuid v1 format so we can
    // validate the input using express-validator
    static getIdentityForSalt(pool: PoolDocument, salt: string) {
        const uuid = this.getUUID(pool, salt);
        return Identity.findOneAndUpdate(
            { poolId: pool._id, uuid },
            { poolId: pool._id, uuid },
            { new: true, upsert: true },
        );
    }
}
