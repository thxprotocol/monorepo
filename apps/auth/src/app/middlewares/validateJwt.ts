import jwksRsa from 'jwks-rsa';
import expressJwtPermissions from 'express-jwt-permissions';
import { expressjwt } from 'express-jwt';
import { AUTH_URL } from '../config/secrets';

export const validateJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${AUTH_URL}/jwks`, // Unnecessary, keys are provided through getKeysInterceptor.
    }),
    issuer: AUTH_URL,
    algorithms: ['RS256'],
});

export const guard = expressJwtPermissions({ requestProperty: 'auth', permissionsProperty: 'scope' });
