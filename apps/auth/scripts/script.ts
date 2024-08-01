import { Account } from '@thxnetwork/auth/models/Account';
import { Token } from '@thxnetwork/auth/models/Token';
import { AccountVariant } from '@thxnetwork/common/enums';
import db from '@thxnetwork/auth/util/database';

db.connect(process.env.MONGODB_URI_PROD);

const accountVariantProviderKindMap: { [variant: number]: string } = {
    [AccountVariant.SSOGoogle]: 'google',
    [AccountVariant.SSOTwitter]: 'twitter',
    [AccountVariant.SSODiscord]: 'discord',
    [AccountVariant.SSOGithub]: 'github',
    [AccountVariant.SSOTwitch]: 'twitch',
};

async function main() {
    const accounts = await Account.find({
        providerUserId: { $exists: false },
        createdAt: { $gte: new Date('2024-08-01') },
    });
    const tokens = await Token.find({ sub: accounts.map((a) => a.id) });

    // Bulk write operations to update accounts in chunks of 1000
    const chunkSize = 1000;
    for (let i = 0; i < accounts.length; i += chunkSize) {
        const chunk = accounts.slice(i, i + chunkSize);
        console.log('Preparing chunk:', i);

        // Create opeartions for accounts where providerUserId is set based on a.variant
        const operations = chunk
            .map((a) => {
                const kind = accountVariantProviderKindMap[a.variant];
                const token = tokens.find((t) => t.sub === a.id && t.kind === kind);
                // console.log('Account', a.id, 'Token', token && token.userId);
                return (
                    token && {
                        updateOne: {
                            filter: { _id: a.id },
                            update: {
                                $set: {
                                    // Set account.providerUserId to token.userId
                                    providerUserId: token.userId,
                                },
                            },
                        },
                    }
                );
            })
            .filter((op) => !!op);
        console.log('Operations:', operations.length);
        await Account.bulkWrite(operations);
        console.log('Finished chunk:', i);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
