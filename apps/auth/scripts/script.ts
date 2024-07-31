import { Account } from '@thxnetwork/auth/models/Account';
import { Token } from '@thxnetwork/auth/models/Token';
import { AccountVariant } from '@thxnetwork/common/enums';
import db from '@thxnetwork/auth/util/database';

db.connect(process.env.MONGODB_URI);

const accountVariantProviderKindMap: { [variant: number]: string } = {
    [AccountVariant.SSOGoogle]: 'google',
    [AccountVariant.SSOTwitter]: 'twitter',
    [AccountVariant.SSODiscord]: 'discord',
    [AccountVariant.SSOGithub]: 'github',
    [AccountVariant.SSOTwitch]: 'twitch',
};

async function main() {
    const accounts = await Account.find({});
    const tokens = await Token.find({ sub: accounts.map((a) => a.id) });

    // Create opeartions for accounts where providerUserId is set based on a.variant
    const operations = accounts.map((a) => {
        const kind = accountVariantProviderKindMap[a.variant];
        const token = tokens.find((t) => t.sub === a.id && t.kind === kind);
        return {
            updateOne: {
                filter: { _id: a.id },
                update: {
                    $set: {
                        // Set account.providerUserId to token.userId
                        providerUserId: token && token.userId,
                    },
                },
            },
        };
    });

    // Bulk write operations to update accounts in chunks of 1000
    const chunkSize = 1000;
    for (let i = 0; i < operations.length; i += chunkSize) {
        const chunk = operations.slice(i, i + chunkSize);
        console.log('Start chunk', i, chunk.length);
        await Account.bulkWrite(chunk);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
