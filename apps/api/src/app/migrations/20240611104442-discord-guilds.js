module.exports = {
    async up(db, client) {
        for (const guild of await db.collection('discordguild').find({}).toArray()) {
            await db.collection('discordguild').updateOne(
                { _id: guild._id },
                {
                    $set: {
                        notifications: {
                            questCreate: { isEnabled: true, message: '', channelId: guild.channelId },
                            questEntryCreate: { isEnabled: true, message: '', channelId: guild.channelId },
                        },
                    },
                },
            );
        }
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
