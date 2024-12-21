import { Request, Response } from 'express';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '@thxnetwork/api/config/secrets';

const controller = async (req: Request, res: Response) => {
    const { clid } = req.body;

    if (!clid) {
        return res.status(400).json({ error: 'clid is required' });
    }

    const url = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    const headers = {
        'Content-Type': 'application/json',
        'Apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };
    const body = {
        email: clid + '@santa.network',
        gotrue_meta_security: {},
        password: clid,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        res.json({ access_token: data.access_token });
    } catch (error) {
        console.error('Error fetching token:', error);

        res.status(500).json({ error: 'Failed to fetch token' });
    }
};

export { controller };
