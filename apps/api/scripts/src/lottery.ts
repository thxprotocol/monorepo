import { CouponCode } from '@thxnetwork/api/models';
import { ObjectId, MongoClient, Db } from 'mongodb';

export default async function main() {
    const client = new MongoClient(process.env.MONGODB_URI_AUTH_PROD);
    await client.connect();
    const db: Db = client.db('auth-prod');

    // Get CouponCode for winning codes
    const winners = [
        'THXV1BVL7XZBF052024',
        // 'THXMM5E1YQG2X052024',
        // 'THX5UATMVUKHY052024',
        // 'THXH2VRRBB8DE052024',
        // 'THX3VE7PIVKGO052024',
        // 'THXKGN5GUSQM5052024',
        // 'THXU8DOC8DIVN052024',
        // 'THXCY3R2NO6P2052024',
    ];
    const codes = await CouponCode.find({ code: { $in: winners }, sub: { $exists: true } });

    // Get subs for winning codes
    const subs = codes.map((code) => code.sub);

    // Get tokens with kind discord for winning codes
    const accounts = await db
        .collection('accounts')
        .find({ _id: { $in: subs.map((sub) => new ObjectId(sub)) } })
        .toArray();

    // Iterate over codes to fetch user details
    for (const winner of winners) {
        try {
            const code = codes.find((code) => code && code.code === winner);
            if (!code) continue;
            const account = accounts.find((account) => String(account._id) == code.sub);
            console.log(account);
            const tokens = await db
                .collection('tokens')
                .find({ sub: String(account._id) })
                .toArray();
            console.log(tokens);
            // const userIds = tokens.map((token) => token.userId).join(' ');
            // console.log(code.code, userIds, account.username, account.email);
        } catch (error) {
            console.error(winner, error);
        }
    }
}
