module.exports = {
    async up(db, client) {
        const pools = await db.collection('pool').find({}).toArray();

        // Webhooks
        const webhookColl = await db.collection('webhook');
        // Move signing secret from pool to webhook
        await webhookColl.bulkWrite(
            pools.map((pool) => {
                return {
                    updateMany: {
                        filter: { poolId: String(pool._id) },
                        update: { $set: { signingSecret: pool.signingSecret, sub: pool.sub } },
                    },
                };
            }),
        );

        // Identities
        const identityColl = await db.collection('identity');
        // Rename all identity.sub to accountId
        await identityColl.updateMany({}, { $rename: { sub: 'accountId' } });
        // Set sub to pool owner
        await identityColl.bulkWrite(
            pools.map((pool) => {
                return {
                    updateMany: {
                        filter: { poolId: String(pool._id) },
                        update: { $set: { sub: pool.sub } },
                    },
                };
            }),
        );

        // Events
        const eventColl = await db.collection('event');
        // Set sub to pool owner
        await eventColl.bulkWrite(
            pools.map((pool) => {
                return {
                    updateMany: {
                        filter: { poolId: String(pool._id) },
                        update: { $set: { sub: pool.sub } },
                    },
                };
            }),
        );
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
