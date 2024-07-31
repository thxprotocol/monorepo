import { SUPABASE_JWT_SECRET, SUPABASE_URL } from '@thxnetwork/api/config/secrets';
import jwt from 'jsonwebtoken';

const options = {
    header: { kid: '0' },
    algorithm: 'RS256',
    expiresIn: '1d',
    issuer: SUPABASE_URL,
};

export const getToken = (sub: string) => {
    const token = jwt.sign({ sub }, SUPABASE_JWT_SECRET, options);
    return `Bearer ${token}`;
};
