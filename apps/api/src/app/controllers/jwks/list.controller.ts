import { JWKS_JSON } from '@thxnetwork/api/config/secrets';
import { Request, Response } from 'express';
import { JWK } from 'node-jose';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const jwks = JSON.parse(JWKS_JSON);
    const keystore = await JWK.asKeyStore(jwks);
    const publicKeystore = keystore.toJSON(false); // False returns only the public keys

    res.json(publicKeystore);
};

export default { controller, validation };
