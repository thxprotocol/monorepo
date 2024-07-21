module.exports = {
    async up(db, client) {
        const pools = await db.collection('pool').find({}).toArray();
        const webhookColl = await db.collection('webhook');
        const operations = pools.map((pool) => {
            return {
                updateMany: {
                    filter: { poolId: pool.poolId },
                    update: { $set: { signingSecret: pool.settings.signingSecret } },
                },
            };
        });

        await webhookColl.bulkWrite(operations);

        await db.collection('identity').updateMany({}, { $rename: { sub: 'accountId' } });
        // Get all unique poolIds
        // Get all pools for poolIds
        // Iterate over pools
        // Create operation for each identity and update sub with pool.sub
        // Execute bulk action
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
