import { CouponCode } from '@thxnetwork/api/models';
import { ObjectId, MongoClient, Db } from 'mongodb';

export default async function main() {
    const client = new MongoClient(process.env.MONGODB_URI_AUTH_PROD);
    await client.connect();
    const db: Db = client.db('auth-prod');

    // Get CouponCode for winning codes
    const winners = [
        'THX02G6NMUMU0052024',
        'THXSUR9F62ZRE052024',
        'THXT51NWPZY0Z052024',
        'THXH7TQX5FETL052024',
        'THXMYH9D2GFAI052024',
        'THXNDZDDSSI3O052024',
        'THXEUIAY54H01052024',
        'THXV1BVL7XZBF052024',
        'THXBI11LY2C2P052024',
        'THXNT5QAUHBNN052024',
    ];
    const codes = await CouponCode.find({ code: { $in: winners } });

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

            const account = accounts.find((account) => String(account._id) === code.sub);
            const tokens = await db
                .collection('tokens')
                .find({ sub: String(account._id) })
                .toArray();
            const userIds = tokens.map((token) => token.userId).join(' ');
            console.log(code.code, userIds, account.username, account.email);
        } catch (error) {
            console.error(winner, error);
        }
    }
}
