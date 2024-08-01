const crypto = require('crypto');

function getSigningSecret(length) {
    return crypto.randomBytes(length).toString('base64');
}

module.exports = {
    async up(db) {
        const clientColl = db.collection('client');
        const clients = await clientColl.find({}).toArray();
        const operations = clients.map((client) => {
            const secret = getSigningSecret(32);
            return {
                updateOne: {
                    filter: { _id: client._id },
                    update: { $set: { secret } },
                },
            };
        });

        await clientColl.bulkWrite(operations);
    },
    async down(db, client) {
        //
    },
};
