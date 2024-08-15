import cors from 'cors';
import { AUTH_URL, API_URL, DASHBOARD_URL, WIDGET_URL, PUBLIC_URL } from '@thxnetwork/api/config/secrets';

export const corsHandler = cors(async (req: any, callback: any) => {
    const origin = req.header('Origin');
    const allowedOrigins = [
        AUTH_URL,
        API_URL,
        DASHBOARD_URL,
        WIDGET_URL,
        PUBLIC_URL,
        'https://thx.network',
        'https://www.thx.network',
        'https://dev-www.thx.network',
        'https://app.thx.network',
        'https://dev-app.thx.network',
        'https://dashboard.thx.network',
        'https://dev-dashboard.thx.network',
    ];

    if (!origin || allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
        callback(null, { credentials: true, origin: allowedOrigins });
    } else {
        callback(new Error(`${origin} is not allowed by CORS`));
    }
});
