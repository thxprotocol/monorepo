import { AUTH_URL, JWKS_JSON } from '@thxnetwork/api/config/secrets';
import { Request, Response } from 'express';
import { JWS, JWK } from 'node-jose';

const validation = [];

const issaudMap = {
    'https://auth.thx.network': '9pY4flpfELV0yf3ZixJHd',
    'https://dev.auth.thx.network': 'DOnILp5nX13GVm5n3WTby',
    'https://local.auth.thx.network': '8pqC-D11si73rCKz8bmNV',
};

async function controller(req: Request, res: Response) {
    const payload = {
        sub: req.auth.sub,
        iss: AUTH_URL,
        aud: issaudMap[AUTH_URL],
        iat: Date.now(),
        exp: Date.now() + 60 * 60 * 1000,
    };
    const jwks = JSON.parse(JWKS_JSON);
    const keystore = await JWK.asKeyStore(jwks);

    // Find a key for signing (e.g., the first key in the keystore)
    const [key] = keystore.all({ use: 'sig' });

    // Create the JWT header
    const header = {
        alg: key.alg || 'RS256',
        typ: 'JWT',
        kid: key.kid,
    };

    // Create the JWT
    const jwt = await JWS.createSign({ format: 'compact', fields: header }, key)
        .update(JSON.stringify(payload))
        .final();

    res.json({ jwt });
}

export default { validation, controller };
