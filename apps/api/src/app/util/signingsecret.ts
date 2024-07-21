import crypto from 'crypto';

export function getSigningSecret(length: number) {
    return crypto.randomBytes(length).toString('base64');
}

export function signPayload(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return hmac.digest('base64');
}
