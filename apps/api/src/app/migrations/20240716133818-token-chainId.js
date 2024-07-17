module.exports = {
    async up(db, client) {
        const walletColl = db.collection('wallet');

        async function updateTokens(tokenColl) {
            const tokenList = await tokenColl.find({});
            const tokens = await tokenList.toArray();
            const walletIds = tokens.map((token) => token.walletId);
            const walletList = await walletColl.find({ walletId: { $in: walletIds } });
            const wallets = await walletList.toArray();
            const operations = tokens
                .map((token) => {
                    const wallet = wallets.find((w) => String(w._id) === token.walletId);
                    return wallet
                        ? {
                              updateOne: {
                                  filter: { _id: token._id },
                                  update: { $set: { chainId: wallet.chainId } },
                              },
                          }
                        : null;
                })
                .filter((w) => !!w);

            if (operations.length) {
                await tokenColl.bulkWrite(operations);
            }
        }

        for (const tokenColl of [
            db.collection('erc20token'),
            db.collection('erc721token'),
            db.collection('erc1155token'),
        ]) {
            await updateTokens(tokenColl);
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
