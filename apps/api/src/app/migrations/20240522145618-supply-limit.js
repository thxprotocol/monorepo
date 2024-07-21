module.exports = {
    async up(db) {
        await db.collection('rewardcoin').updateMany({}, [{ $set: { limitSupply: '$limit', limit: 0 } }]);
        await db.collection('rewardnft').updateMany({}, [{ $set: { limitSupply: '$limit', limit: 0 } }]);
        await db.collection('rewardcoupon').updateMany({}, [{ $set: { limitSupply: '$limit', limit: 0 } }]);
        await db.collection('rewardcustom').updateMany({}, [{ $set: { limitSupply: '$limit', limit: 0 } }]);
        await db.collection('rewarddiscordrole').updateMany({}, [{ $set: { limitSupply: '$limit', limit: 0 } }]);
    },

    async down() {
        //
    },
};
