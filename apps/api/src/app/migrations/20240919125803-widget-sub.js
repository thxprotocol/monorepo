module.exports = {
    async up(db, client) {
        const widgetColl = db.collection('widget');
        const poolColl = db.collection('pool');
        const brandColl = db.collection('brand');
        const widgets = await widgetColl.find({}).toArray();
        const pools = await poolColl.find({}).toArray();
        const brands = await brandColl.find({}).toArray();
        const operations = widgets.map((w) => {
            const pool = pools.find((p) => String(p._id) == w.poolId);
            const brand = brands.find((b) => b.poolId == w.poolId);
            if (!pool) return;

            return {
                updateOne: {
                    filter: { _id: w._id },
                    update: {
                        $set: {
                            sub: pool.sub,
                            slug: pool.slug,
                            name: pool.settings.title,
                            description: pool.settings.description,
                            logoImgURL: brand && brand.logoImgUrl,
                            backgroundImgURL: brand && brand.backgroundImgUrl,
                        },
                    },
                },
            };
        });

        await widgetColl.bulkWrite(operations);
    },
    async down(db, client) {
        //
    },
};
