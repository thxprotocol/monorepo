import {
    API_URL,
    AUTH_URL,
    DASHBOARD_URL,
    PUBLIC_URL,
    STUDIO_URL,
    WALLET_URL,
    WIDGET_URL,
} from '@thxnetwork/api/config/secrets';
import cors from 'cors';
import { Widget } from '../models';

export const corsHandler = cors(async (req: any, callback: any) => {
    const origin = req.header('Origin');
    const domains = await Widget.find({ domain: { $exists: true, $ne: 'https://www.example.com' } }).distinct('domain');
    const allowedOrigins = [
        AUTH_URL,
        API_URL,
        DASHBOARD_URL,
        STUDIO_URL,
        WALLET_URL,
        WIDGET_URL,
        PUBLIC_URL,
        'https://thx.network',
        'https://www.thx.network',
        'https://dev-www.thx.network',
        'https://app.thx.network',
        'https://dev-app.thx.network',
        'https://dashboard.thx.network',
        'https://dev-dashboard.thx.network',
        'https://studio.thx.network',
        'https://dev-studio.thx.network',
        'https://wallet.thx.network',
        'https://dev-wallet.thx.network',
        'https://app.twinstory.io',
        'https://dev-app.twinstory.io',
        'https://admin.twinstory.io',
        'https://dev-admin.twinstory.io',
        ...domains,
    ];

    if (!origin || allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
        callback(null, { credentials: true, origin: allowedOrigins });
    } else {
        callback(new Error(`${origin} is not allowed by CORS`));
    }
});
